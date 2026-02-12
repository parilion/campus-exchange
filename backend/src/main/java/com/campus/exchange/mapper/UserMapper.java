package com.campus.exchange.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.exchange.model.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
