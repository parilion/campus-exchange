package com.campus.exchange.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.campus.exchange.dto.BargainRequest;
import com.campus.exchange.dto.BargainVO;
import com.campus.exchange.service.BargainService;
import com.campus.exchange.util.Result;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/bargains")
public class BargainController {

    private final BargainService bargainService;

    public BargainController(BargainService bargainService) {
        this.bargainService = bargainService;
    }

    /**
     * 发起议价
     */
    @PostMapping
    public Result<BargainVO> createBargain(@Valid @RequestBody BargainRequest request) {
        Long userId = getCurrentUserId();
        BargainVO bargain = bargainService.createBargain(userId, request);
        return Result.success(bargain);
    }

    /**
     * 获取商品的所有议价记录
     */
    @GetMapping("/product/{productId}")
    public Result<List<BargainVO>> getBargainsByProduct(@PathVariable Long productId) {
        List<BargainVO> bargains = bargainService.getBargainsByProduct(productId);
        return Result.success(bargains);
    }

    /**
     * 获取当前用户的议价列表
     */
    @GetMapping
    public Result<IPage<BargainVO>> getUserBargains(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = getCurrentUserId();
        IPage<BargainVO> bargains = bargainService.getUserBargains(userId, page, size);
        return Result.success(bargains);
    }

    /**
     * 接受议价
     */
    @PostMapping("/{id}/accept")
    public Result<BargainVO> acceptBargain(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        BargainVO bargain = bargainService.acceptBargain(id, userId);
        return Result.success(bargain);
    }

    /**
     * 拒绝议价
     */
    @PostMapping("/{id}/reject")
    public Result<BargainVO> rejectBargain(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        BargainVO bargain = bargainService.rejectBargain(id, userId);
        return Result.success(bargain);
    }

    /**
     * 取消议价
     */
    @PostMapping("/{id}/cancel")
    public Result<BargainVO> cancelBargain(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        BargainVO bargain = bargainService.cancelBargain(id, userId);
        return Result.success(bargain);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (Long) authentication.getPrincipal();
    }
}
