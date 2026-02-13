# Campus Exchange - 自动开发循环脚本 (Windows PowerShell)
# 用法: powershell -ExecutionPolicy Bypass -File scripts\auto-dev.ps1 -Iterations 10
# 或:   .\scripts\auto-dev.ps1 -Iterations 10

param(
    [Parameter(Mandatory=$true)]
    [ValidateRange(1, 1000)]
    [int]$Iterations
)

$ErrorActionPreference = "Continue"

# ========== 配置 ==========
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$LogDir = Join-Path $ProjectRoot "logs"
$LogFile = Join-Path $LogDir "auto-dev_${Timestamp}.log"

# 传给 Claude 的固定 prompt
$Prompt = @'
你是校园二手交易平台 campus-exchange 的开发工程师。请严格按以下流程工作：

1. 读取 claude-progress.md 了解当前开发状态
2. 执行 git log --oneline -5 查看最近提交
3. 读取 features.json，找到 passes 为 false 的功能项，按优先级排序（P0 > P1 > P2），选择第一个未完成的功能
4. 实现该功能：
   - 后端：创建/修改 Controller、Service、Mapper、Model、DTO 等
   - 前端：创建/修改页面、组件、API 调用、路由等
   - 确保代码能编译通过（后端 mvn compile，前端 tsc --noEmit）
5. 实现完成后，用 git 提交（遵循 Conventional Commits 规范）
6. 执行 git push origin main 推送到远程仓库
7. 将 features.json 中该功能的 passes 字段改为 true
8. 更新 claude-progress.md 记录本次完成的工作

注意：
- 一次只实现一个功能，做完就提交并推送
- 阅读 CLAUDE.md 了解编码规范和 Git 仓库信息
- 如果某个功能依赖数据库但无法连接，先写好代码确保编译通过，跳过运行时测试
- 提交信息使用英文
- 远程仓库: https://github.com/parilion/campus-exchange (分支: main)
'@

# ========== 工具函数 ==========
function Write-Log {
    param([string]$Message, [string]$Level = "INFO", [string]$Color = "White")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] [$Level] $Message"
    Write-Host $line -ForegroundColor $Color
    Add-Content -Path $LogFile -Value $line -Encoding UTF8
}

function Write-Info    { param([string]$Msg) Write-Log $Msg "INFO" "Cyan" }
function Write-Ok      { param([string]$Msg) Write-Log $Msg "OK" "Green" }
function Write-Warn    { param([string]$Msg) Write-Log $Msg "WARN" "Yellow" }
function Write-Err     { param([string]$Msg) Write-Log $Msg "FAIL" "Red" }
function Write-Sep {
    $sep = "=" * 60
    Write-Host $sep -ForegroundColor DarkCyan
    Add-Content -Path $LogFile -Value $sep -Encoding UTF8
}

function Get-Progress {
    $json = Join-Path $ProjectRoot "features.json"
    if (Test-Path $json) {
        $content = Get-Content $json -Raw -Encoding UTF8
        $total = ([regex]::Matches($content, '"passes"')).Count
        $done  = ([regex]::Matches($content, '"passes":\s*true')).Count
        return "$done/$total"
    }
    return "0/0"
}

# ========== 初始化 ==========
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

Set-Location $ProjectRoot

Write-Sep
Write-Info "Campus Exchange 自动开发循环"
Write-Info "计划执行: $Iterations 次"
Write-Info "项目目录: $ProjectRoot"
Write-Info "日志文件: $LogFile"
Write-Info "当前进度: $(Get-Progress)"
Write-Sep

# 检查 claude 命令
$claudeCmd = Get-Command claude -ErrorAction SilentlyContinue
if (-not $claudeCmd) {
    Write-Err "claude 命令未找到，请先安装 Claude Code CLI"
    exit 1
}
Write-Ok "Claude Code CLI 已就绪"

# ========== 主循环 ==========
$SuccessCount = 0
$FailCount = 0

for ($i = 1; $i -le $Iterations; $i++) {
    $iterStart = Get-Date
    Write-Sep
    Write-Info "第 $i/$Iterations 轮开始"
    Write-Info "当前功能进度: $(Get-Progress)"

    # 记录本轮开始前的 git commit hash
    $beforeHash = git rev-parse HEAD 2>$null
    if (-not $beforeHash) { $beforeHash = "none" }

    # 每轮的详细日志
    $iterLog = Join-Path $LogDir "iteration_${i}_${Timestamp}.log"

    Write-Info "正在调用 Claude Code..."

    # 调用 Claude Code
    # -p: 非交互模式
    # --dangerously-skip-permissions: 跳过所有权限确认
    # --max-turns: 限制最大轮次防止无限循环
    $process = Start-Process -FilePath "claude" `
        -ArgumentList "-p", "`"$Prompt`"", "--dangerously-skip-permissions", "--max-turns", "50" `
        -WorkingDirectory $ProjectRoot `
        -NoNewWindow `
        -Wait `
        -PassThru `
        -RedirectStandardOutput $iterLog `
        -RedirectStandardError (Join-Path $LogDir "iteration_${i}_${Timestamp}_err.log")

    $iterEnd = Get-Date
    $duration = [math]::Round(($iterEnd - $iterStart).TotalSeconds)
    $exitCode = $process.ExitCode

    if ($exitCode -eq 0) {
        $afterHash = git rev-parse HEAD 2>$null
        if ($afterHash -and $beforeHash -ne $afterHash) {
            $lastCommit = git log -1 --oneline 2>$null
            Write-Ok "第 $i 轮完成 (${duration}s) - 新提交: $lastCommit"
        } else {
            Write-Warn "第 $i 轮完成 (${duration}s) - 无新提交"
        }
        $SuccessCount++
    } else {
        Write-Err "第 $i 轮失败 (${duration}s, exit=$exitCode) - 详情见: $iterLog"
        $FailCount++
    }

    Write-Info "累计: 成功=$SuccessCount 失败=$FailCount 进度=$(Get-Progress)"

    # 轮间冷却，避免 API 限流
    if ($i -lt $Iterations) {
        Write-Info "等待 5 秒后开始下一轮..."
        Start-Sleep -Seconds 5
    }
}

# ========== 最终报告 ==========
Write-Sep
Write-Info "所有轮次执行完毕"
Write-Info "总轮次: $Iterations"
Write-Ok   "成功: $SuccessCount"
if ($FailCount -gt 0) { Write-Err "失败: $FailCount" } else { Write-Info "失败: 0" }
Write-Info "最终进度: $(Get-Progress)"
Write-Info "Git 提交历史:"
git log --oneline -$Iterations 2>$null | ForEach-Object { Write-Info "  $_" }
Write-Sep
Write-Info "日志目录: $LogDir"
