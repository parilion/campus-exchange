import { useState, useEffect, useRef } from 'react';
import { Input, Typography, Tag, Empty, Divider, Space } from 'antd';
import { SearchOutlined, HistoryOutlined, FireOutlined, DeleteOutlined } from '@ant-design/icons';
import { getSearchSuggestions, getPopularSearches } from '../services/product';
import './SearchBox.css';

const { Text } = Typography;

// 搜索历史 key
const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY = 10;

interface SearchBoxProps {
  defaultValue?: string;
  onSearch: (value: string) => void;
}

export default function SearchBox({ defaultValue = '', onSearch }: SearchBoxProps) {
  const [keyword, setKeyword] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'popular'>('history');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 加载搜索历史
  useEffect(() => {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch {
        setSearchHistory([]);
      }
    }
  }, []);

  // 加载热门搜索
  useEffect(() => {
    getPopularSearches().then(setPopularSearches).catch(() => {});
  }, []);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 防抖获取搜索建议
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (keyword.trim()) {
      debounceRef.current = setTimeout(() => {
        getSearchSuggestions(keyword)
          .then(setSuggestions)
          .catch(() => setSuggestions([]));
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [keyword]);

  // 保存搜索历史
  const saveSearchHistory = (value: string) => {
    if (!value.trim()) return;

    let history = searchHistory.filter(h => h !== value);
    history = [value, ...history].slice(0, MAX_HISTORY);
    setSearchHistory(history);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  };

  // 删除单条历史记录
  const deleteHistory = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const history = searchHistory.filter(h => h !== value);
    setSearchHistory(history);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  };

  // 清空历史记录
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    if (!value.trim()) return;
    saveSearchHistory(value);
    onSearch(value);
    setShowDropdown(false);
  };

  // 处理输入变化
  const handleChange = (value: string) => {
    setKeyword(value);
    if (value.trim()) {
      setShowDropdown(true);
      setSuggestions([]);
    } else {
      setShowDropdown(true);
    }
  };

  // 处理建议点击
  const handleSuggestionClick = (suggestion: string) => {
    setKeyword(suggestion);
    handleSearch(suggestion);
  };

  // 处理热门搜索点击
  const handlePopularClick = (value: string) => {
    setKeyword(value);
    handleSearch(value);
  };

  // 渲染空状态
  const renderEmpty = () => (
    <div className="search-dropdown-empty">
      <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
    </div>
  );

  return (
    <div className="search-box" ref={wrapperRef}>
      <Input.Search
        placeholder="搜索商品..."
        allowClear
        value={keyword}
        onChange={(e) => handleChange(e.target.value)}
        onSearch={handleSearch}
        onFocus={() => setShowDropdown(true)}
        enterButton={<SearchOutlined />}
        style={{ width: '100%' }}
        className="search-input"
      />

      {showDropdown && (
        <div className="search-dropdown">
          {/* 搜索建议 */}
          {suggestions.length > 0 ? (
            <div className="search-suggestions">
              <div className="search-section-title">
                <SearchOutlined /> 搜索建议
              </div>
              <div className="search-suggestion-list">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="search-suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Text ellipsis>{suggestion}</Text>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* 历史记录和热门搜索 Tab */}
              <div className="search-tabs">
                <div
                  className={`search-tab ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  <HistoryOutlined /> 搜索历史
                </div>
                <div
                  className={`search-tab ${activeTab === 'popular' ? 'active' : ''}`}
                  onClick={() => setActiveTab('popular')}
                >
                  <FireOutlined /> 热门推荐
                </div>
              </div>

              {/* 历史记录 */}
              {activeTab === 'history' && (
                <div className="search-history">
                  {searchHistory.length > 0 ? (
                    <>
                      <div className="search-history-header">
                        <Text type="secondary">最近搜索</Text>
                        <Text
                          type="secondary"
                          className="clear-history"
                          onClick={clearHistory}
                        >
                          清空
                        </Text>
                      </div>
                      <div className="search-history-list">
                        {searchHistory.map((item, index) => (
                          <div
                            key={index}
                            className="search-history-item"
                            onClick={() => handleSearch(item)}
                          >
                            <Text ellipsis>{item}</Text>
                            <DeleteOutlined
                              className="delete-icon"
                              onClick={(e) => deleteHistory(item, e)}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="search-dropdown-empty">
                      <Empty description="暂无搜索历史" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </div>
                  )}
                </div>
              )}

              {/* 热门推荐 */}
              {activeTab === 'popular' && (
                <div className="search-popular">
                  <div className="search-section-title">
                    <FireOutlined /> 热门搜索
                  </div>
                  <div className="search-popular-list">
                    <Space wrap>
                      {popularSearches.map((item, index) => (
                        <Tag
                          key={index}
                          className="search-popular-tag"
                          onClick={() => handlePopularClick(item)}
                        >
                          {item}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
