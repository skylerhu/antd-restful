import * as treeUtils from "src/common/treeUtils";

describe("treeUtils", () => {
  // 测试数据
  const mockTreeData = [
    {
      id: 1,
      name: "根节点1",
      children: [
        {
          id: 11,
          name: "子节点1-1",
          children: [
            {
              id: 111,
              name: "子节点1-1-1"
            }
          ]
        },
        {
          id: 12,
          name: "子节点1-2"
        }
      ]
    },
    {
      id: 2,
      name: "根节点2",
      children: [
        {
          id: 21,
          name: "子节点2-1"
        }
      ]
    }
  ];

  describe("patchTreeNodeInfo", () => {
    it("应该为树节点添加key字段", () => {
      const treeData = JSON.parse(JSON.stringify(mockTreeData));
      treeUtils.patchTreeNodeInfo(treeData, { fieldKey: "id" });

      expect(treeData[0].id).toBe(1);
      expect(treeData[0].children[0].id).toBe(11);
      expect(treeData[0].children[0].children[0].id).toBe(111);
    });

    it("应该根据labelTemplate格式化label", () => {
      const treeData = JSON.parse(JSON.stringify(mockTreeData));
      treeUtils.patchTreeNodeInfo(treeData, {
        fieldKey: "id",
        labelTemplate: "节点: {name}"
      });

      expect(treeData[0].label).toBe("节点: 根节点1");
      expect(treeData[0].children[0].label).toBe("节点: 子节点1-1");
    });

    it("应该在isLoadAll为true时标记叶子节点", () => {
      const treeData = [
        {
          id: 1,
          name: "节点1",
          children: null
        },
        {
          id: 2,
          name: "节点2",
          children: []
        }
      ];

      treeUtils.patchTreeNodeInfo(treeData, {
        fieldKey: "id",
        isLoadAll: true
      });

      expect(treeData[0].isLeaf).toBe(true);
      expect(treeData[1].isLeaf).toBeUndefined();
    });

    it("应该保留已有的isLeaf属性", () => {
      const treeData = [
        {
          id: 1,
          name: "节点1",
          isLeaf: false,
          children: null
        }
      ];

      treeUtils.patchTreeNodeInfo(treeData, {
        fieldKey: "id",
        isLoadAll: true
      });

      expect(treeData[0].isLeaf).toBe(false);
    });

    it("应该处理空数组", () => {
      const treeData = [];
      expect(() => {
        treeUtils.patchTreeNodeInfo(treeData, { fieldKey: "id" });
      }).not.toThrow();
    });

    it("应该使用自定义字段名", () => {
      const customTreeData = [
        {
          customId: 1,
          name: "节点1",
          subNodes: [
            {
              customId: 11,
              name: "子节点1-1"
            }
          ]
        }
      ];

      treeUtils.patchTreeNodeInfo(customTreeData, {
        fieldKey: "customId",
        fieldChildren: "subNodes"
      });

      expect(customTreeData[0].customId).toBe(1);
      expect(customTreeData[0].subNodes[0].customId).toBe(11);
    });
  });

  describe("findNodeByKey", () => {
    it("应该找到存在的节点", () => {
      const result = treeUtils.findNodeByKey(mockTreeData, 11, { fieldKey: "id" });
      expect(result).toBeTruthy();
      expect(result.id).toBe(11);
      expect(result.name).toBe("子节点1-1");
    });

    it("应该找到深层嵌套的节点", () => {
      const result = treeUtils.findNodeByKey(mockTreeData, 111, { fieldKey: "id" });
      expect(result).toBeTruthy();
      expect(result.id).toBe(111);
      expect(result.name).toBe("子节点1-1-1");
    });

    it("应该在节点不存在时返回null", () => {
      const result = treeUtils.findNodeByKey(mockTreeData, 999, { fieldKey: "id" });
      expect(result).toBeNull();
    });

    it("应该在传入空数据时返回null", () => {
      const result = treeUtils.findNodeByKey([], 1, { fieldKey: "id" });
      expect(result).toBeNull();
    });

    it("应该在传入空key时返回null", () => {
      const result = treeUtils.findNodeByKey(mockTreeData, null, { fieldKey: "id" });
      expect(result).toBeNull();
    });

    it("应该使用自定义字段名查找", () => {
      const customTreeData = [
        {
          customId: 1,
          name: "节点1",
          subNodes: [
            {
              customId: 11,
              name: "子节点1-1"
            }
          ]
        }
      ];

      const result = treeUtils.findNodeByKey(customTreeData, 11, {
        fieldKey: "customId",
        fieldChildren: "subNodes"
      });

      expect(result).toBeTruthy();
      expect(result.customId).toBe(11);
    });
  });

  describe("findNodesByKeys", () => {
    it("应该找到多个存在的节点", () => {
      const result = treeUtils.findNodesByKeys(mockTreeData, [1, 11, 21], { fieldKey: "id" });
      expect(result).toHaveLength(3);
      expect(result.map(node => node.id)).toEqual(expect.arrayContaining([1, 11, 21]));
    });

    it("应该处理单个key", () => {
      const result = treeUtils.findNodesByKeys(mockTreeData, 11, { fieldKey: "id" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(11);
    });

    it("应该在没有找到节点时返回空数组", () => {
      const result = treeUtils.findNodesByKeys(mockTreeData, [999, 888], { fieldKey: "id" });
      expect(result).toEqual([]);
    });

    it("应该在传入空数组时返回空数组", () => {
      const result = treeUtils.findNodesByKeys([], [1, 2], { fieldKey: "id" });
      expect(result).toEqual([]);
    });

    it("应该在传入空keys时返回空数组", () => {
      const result = treeUtils.findNodesByKeys(mockTreeData, [], { fieldKey: "id" });
      expect(result).toEqual([]);
    });

    it("应该找到部分存在的节点", () => {
      const result = treeUtils.findNodesByKeys(mockTreeData, [1, 999, 21], { fieldKey: "id" });
      expect(result).toHaveLength(2);
      expect(result.map(node => node.id)).toEqual(expect.arrayContaining([1, 21]));
    });
  });

  describe("refreshTreeKeyMap", () => {
    it("应该创建正确的key-value映射", () => {
      const result = treeUtils.refreshTreeKeyMap(mockTreeData, { fieldKey: "id" });

      expect(result[1]).toBeTruthy();
      expect(result[1].name).toBe("根节点1");
      expect(result[11]).toBeTruthy();
      expect(result[11].name).toBe("子节点1-1");
      expect(result[111]).toBeTruthy();
      expect(result[111].name).toBe("子节点1-1-1");
    });

    it("应该包含所有节点", () => {
      const result = treeUtils.refreshTreeKeyMap(mockTreeData, { fieldKey: "id" });

      expect(Object.keys(result)).toHaveLength(6);
      expect(result).toHaveProperty("1");
      expect(result).toHaveProperty("11");
      expect(result).toHaveProperty("111");
      expect(result).toHaveProperty("12");
      expect(result).toHaveProperty("2");
      expect(result).toHaveProperty("21");
    });

    it("应该处理空数组", () => {
      const result = treeUtils.refreshTreeKeyMap([], { fieldKey: "id" });
      expect(result).toEqual({});
    });

    it("应该使用自定义字段名", () => {
      const customTreeData = [
        {
          customId: 1,
          name: "节点1",
          subNodes: [
            {
              customId: 11,
              name: "子节点1-1"
            }
          ]
        }
      ];

      const result = treeUtils.refreshTreeKeyMap(customTreeData, {
        fieldKey: "customId",
        fieldChildren: "subNodes"
      });

      expect(result[1]).toBeTruthy();
      expect(result[11]).toBeTruthy();
    });
  });

  describe("insertChildrenToTreeNode", () => {
    it("应该将节点插入到指定父节点", () => {
      const treeData = JSON.parse(JSON.stringify(mockTreeData));
      const newNodes = [
        { id: 13, name: "新子节点1-3" },
        { id: 14, name: "新子节点1-4" }
      ];

      const result = treeUtils.insertChildrenToTreeNode(treeData, newNodes, 1, { fieldKey: "id" });

      const parentNode = treeUtils.findNodeByKey(result, 1, { fieldKey: "id" });
      expect(parentNode.children).toHaveLength(2);
      expect(parentNode.children[0].id).toBe(13);
      expect(parentNode.children[1].id).toBe(14);
    });

    it("应该在parentKey为空时返回新节点", () => {
      const newNodes = [
        { id: 1, name: "新根节点1" },
        { id: 2, name: "新根节点2" }
      ];

      const result = treeUtils.insertChildrenToTreeNode(mockTreeData, newNodes, null, { fieldKey: "id" });

      expect(result).toBe(newNodes);
      expect(result).toHaveLength(2);
    });

    it("应该在传入空节点时返回原树数据", () => {
      const result = treeUtils.insertChildrenToTreeNode(mockTreeData, [], 1, { fieldKey: "id" });
      expect(result).toBe(mockTreeData);
    });

    it("应该在传入null节点时返回原树数据", () => {
      const result = treeUtils.insertChildrenToTreeNode(mockTreeData, null, 1, { fieldKey: "id" });
      expect(result).toBe(mockTreeData);
    });

    it("应该在找不到父节点时返回原树数据", () => {
      const treeData = JSON.parse(JSON.stringify(mockTreeData));
      const newNodes = [{ id: 99, name: "新节点" }];

      const result = treeUtils.insertChildrenToTreeNode(treeData, newNodes, 999, { fieldKey: "id" });
      expect(result).toBe(treeData);
    });

    it("应该在树数据为空时返回新节点", () => {
      const newNodes = [{ id: 1, name: "新节点1" }];

      const result = treeUtils.insertChildrenToTreeNode([], newNodes, null, { fieldKey: "id" });
      expect(result).toBe(newNodes);
    });

    it("应该使用自定义字段名", () => {
      const customTreeData = [
        {
          customId: 1,
          name: "节点1",
          subNodes: [
            {
              customId: 11,
              name: "子节点1-1"
            }
          ]
        }
      ];

      const newNodes = [
        { customId: 12, name: "新子节点1-2" }
      ];

      const result = treeUtils.insertChildrenToTreeNode(customTreeData, newNodes, 1, {
        fieldKey: "customId",
        fieldChildren: "subNodes"
      });

      expect(result[0].subNodes).toHaveLength(1);
      expect(result[0].subNodes[0].customId).toBe(12);
    });
  });
});
