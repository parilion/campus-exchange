package com.campus.exchange.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.exchange.model.BrowseHistory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface BrowseHistoryMapper extends BaseMapper<BrowseHistory> {

    @Select("SELECT product_id FROM browse_history WHERE user_id = #{userId} ORDER BY create_time DESC LIMIT #{limit}")
    List<Long> findProductIdsByUserId(@Param("userId") Long userId, @Param("limit") Integer limit);

    @Select("SELECT * FROM browse_history WHERE user_id = #{userId} AND product_id = #{productId}")
    BrowseHistory findByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);
}
