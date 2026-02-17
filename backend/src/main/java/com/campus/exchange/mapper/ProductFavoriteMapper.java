package com.campus.exchange.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.exchange.model.ProductFavorite;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ProductFavoriteMapper extends BaseMapper<ProductFavorite> {

    @Select("SELECT product_id FROM product_favorite WHERE user_id = #{userId}")
    List<Long> findProductIdsByUserId(@Param("userId") Long userId);
}
