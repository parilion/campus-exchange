package com.campus.exchange.controller;

import com.campus.exchange.model.Address;
import com.campus.exchange.service.AddressService;
import com.campus.exchange.util.Result;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * 收货地址接口
 */
@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    /** 获取当前用户所有地址 */
    @GetMapping
    public Result<List<Address>> getAddresses() {
        Long userId = getCurrentUserId();
        return Result.success(addressService.getUserAddresses(userId));
    }

    /** 新增地址 */
    @PostMapping
    public Result<Address> addAddress(@RequestBody Address address) {
        Long userId = getCurrentUserId();
        return Result.success(addressService.addAddress(userId, address));
    }

    /** 更新地址 */
    @PutMapping("/{id}")
    public Result<Void> updateAddress(@PathVariable Long id, @RequestBody Address address) {
        Long userId = getCurrentUserId();
        addressService.updateAddress(id, userId, address);
        return Result.success();
    }

    /** 删除地址 */
    @DeleteMapping("/{id}")
    public Result<Void> deleteAddress(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        addressService.deleteAddress(id, userId);
        return Result.success();
    }

    /** 设为默认地址 */
    @PutMapping("/{id}/default")
    public Result<Void> setDefault(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        addressService.setDefault(id, userId);
        return Result.success();
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return Long.parseLong(auth.getName());
    }
}
