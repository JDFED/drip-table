---
order: 4
title: 数据预览配置
---

# 数据预览配置

> 本篇主要介绍如何利用 `drip-table-generator` 手动配置默认数据以及数据对应字段。

## 自动预览数据配置

`drip-table-generator` 提供了 `dataSource` 和 [🔗`dataFields`](/drip-table-generator/props/data-fields) 两个字段，两个字段需要配合使用，从而实现表格数据的预览。其中 `dataSource` 负责表格数据的预览， `dataFields` 设置字段选择器下拉框数据。

效果如下图所示：
![image](https://img10.360buyimg.com/imagetools/jfs/t1/48534/10/19306/122691/62b42979E89231a8b/0ee548c0487f1f24.png)


## 手动默认数据配置

`drip-table-generator` 提供了 [🔗`mockDataSource`](/drip-table-generator/props/mock-data-source) 字段控制属性栏“表格数据”选项卡的显隐控制，当打开时提供文本编辑器，允许用户手动输入数据来覆盖 `dataSource` 字段传入的值。

效果如下图所示：
![image](https://img13.360buyimg.com/imagetools/jfs/t1/85436/3/27497/208559/62b42993E9209cde2/3c57cb5f1270e2bf.png)