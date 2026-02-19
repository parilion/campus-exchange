package com.campus.exchange.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.campus.exchange.mapper.AddressMapper;
import com.campus.exchange.model.Address;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 收货地址服务
 */
@Service
public class AddressService {

    private final AddressMapper addressMapper;

    public AddressService(AddressMapper addressMapper) {
        this.addressMapper = addressMapper;
    }

    /**
     * 获取用户所有地址
     */
    public List<Address> getUserAddresses(Long userId) {
        return addressMapper.selectList(
                new LambdaQueryWrapper<Address>()
                        .eq(Address::getUserId, userId)
                        .orderByDesc(Address::getIsDefault)
                        .orderByDesc(Address::getCreatedAt)
        );
    }

    /**
     * 获取地址详情（验证归属）
     */
    public Address getAddressById(Long addressId, Long userId) {
        Address address = addressMapper.selectById(addressId);
        if (address == null || !address.getUserId().equals(userId)) {
            throw new IllegalArgumentException("地址不存在");
        }
        return address;
    }

    /**
     * 新增地址
     */
    @Transactional
    public Address addAddress(Long userId, Address address) {
        address.setUserId(userId);
        // 如果是第一个地址，自动设为默认
        long count = addressMapper.selectCount(
                new LambdaQueryWrapper<Address>().eq(Address::getUserId, userId)
        );
        if (count == 0) {
            address.setIsDefault(true);
        }
        // 如果设为默认，取消其他默认地址
        if (Boolean.TRUE.equals(address.getIsDefault())) {
            cancelOtherDefaults(userId);
        } else {
            address.setIsDefault(false);
        }
        addressMapper.insert(address);
        return address;
    }

    /**
     * 更新地址
     */
    @Transactional
    public void updateAddress(Long addressId, Long userId, Address updateData) {
        Address address = getAddressById(addressId, userId);
        // 如果设为默认，取消其他默认地址
        if (Boolean.TRUE.equals(updateData.getIsDefault())) {
            cancelOtherDefaults(userId);
        }
        updateData.setId(addressId);
        updateData.setUserId(userId);
        addressMapper.updateById(updateData);
    }

    /**
     * 删除地址
     */
    @Transactional
    public void deleteAddress(Long addressId, Long userId) {
        Address address = getAddressById(addressId, userId);
        addressMapper.deleteById(addressId);
        // 如果删除的是默认地址，自动设置最新地址为默认
        if (Boolean.TRUE.equals(address.getIsDefault())) {
            List<Address> remaining = getUserAddresses(userId);
            if (!remaining.isEmpty()) {
                Address first = remaining.get(0);
                first.setIsDefault(true);
                addressMapper.updateById(first);
            }
        }
    }

    /**
     * 设为默认地址
     */
    @Transactional
    public void setDefault(Long addressId, Long userId) {
        getAddressById(addressId, userId); // 验证归属
        cancelOtherDefaults(userId);
        addressMapper.update(null,
                new LambdaUpdateWrapper<Address>()
                        .eq(Address::getId, addressId)
                        .set(Address::getIsDefault, true)
        );
    }

    /**
     * 取消该用户其他默认地址
     */
    private void cancelOtherDefaults(Long userId) {
        addressMapper.update(null,
                new LambdaUpdateWrapper<Address>()
                        .eq(Address::getUserId, userId)
                        .eq(Address::getIsDefault, true)
                        .set(Address::getIsDefault, false)
        );
    }
}
