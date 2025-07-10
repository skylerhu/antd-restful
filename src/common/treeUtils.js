import { commonFormat } from "./parser";
import { isArray, isBlank, isEmpty, isNull } from "./typeTools";

/**
 * 更具设置更新tredData中属性值
 * @param {Array} treeData 树结构数据
 * @param {Object} options 选项
 * @param {string} options.fieldKey 字段key,会作为tree结点唯一值
 * @param {string} options.labelTemplate label模板
 * @param {boolean} options.isLoadAll treeData是否是加载的全部结点
 */
export const patchTreeNodeInfo = (
  treeData,
  { fieldKey = "key", fieldChildren = "children", labelTemplate, isLoadAll = false }
) => {
  for (let i = 0; i < treeData.length; i++) {
    const node = treeData[i];
    if (node[fieldKey] === undefined) {
      // 补充必须的key字段
      node.key = node[fieldKey];
    }
    if (labelTemplate) {
      // 格式化label
      node.label = commonFormat(labelTemplate, node);
    }
    // 判断是否叶子结点
    if (!isBlank(node.isLeaf)) {
      // 数据中已有的不做处理
    } else if (isLoadAll && isNull(node[fieldChildren])) {
      // 加载全部结点后，若无子结点，则认为是叶子结点
      node.isLeaf = true;
    }
    if (isArray(node[fieldChildren])) {
      patchTreeNodeInfo(node[fieldChildren], { fieldKey, fieldChildren, labelTemplate, isLoadAll });
    }
  }
};

/**
 * 从数结构数据中，根据parentKey找到对应结点
 */
export const findNodeByKey = (treeData, nodeKey, { fieldKey = "key", fieldChildren = "children" }) => {
  if (isEmpty(nodeKey) || isEmpty(treeData)) {
    return null;
  }

  // 递归查找父类结点
  for (let i = 0; i < treeData.length; i++) {
    const node = treeData[i];
    const value = node[fieldKey];
    if (nodeKey && value === nodeKey) {
      return node;
    }
    if (nodeKey && !isEmpty(node[fieldChildren])) {
      return findNodeByKey(node[fieldChildren], nodeKey, { fieldKey, fieldChildren });
    }
  }
  return null;
};

export const findNodesByKeys = (treeData, nodeKeys, { fieldKey = "key", fieldChildren = "children" }) => {
  if (isEmpty(nodeKeys) || isEmpty(treeData)) {
    return [];
  }
  if (!isArray(nodeKeys)) {
    // 转换为数组
    nodeKeys = [nodeKeys];
  }

  let nodes = [];
  // 递归查找父类结点
  for (let i = 0; i < treeData.length; i++) {
    const node = treeData[i];
    const value = node[fieldKey];
    if (nodeKeys.includes(value)) {
      nodes.push(node);
    }
    if (!isEmpty(node[fieldChildren])) {
      nodes = nodes.concat(...findNodesByKeys(node[fieldChildren], nodeKeys, { fieldKey, fieldChildren }));
    }
  }
  return nodes;
};

export const refreshTreeKeyMap = (treeData, { fieldKey = "key", fieldChildren = "children" }) => {
  let mapData = {};
  for (let i = 0; i < treeData.length; i++) {
    const node = treeData[i];
    mapData[node[fieldKey]] = node;
    if (!isEmpty(node[fieldChildren])) {
      const _data = refreshTreeKeyMap(node[fieldChildren], { fieldKey, fieldChildren });
      mapData = { ...mapData, ..._data };
    }
  }
  return mapData;
};

/**
 * 向树结构数据treeData中，将nodes插入作为某结点的children
 */
export const insertChildrenToTreeNode = (treeData, nodes, parentKey, { fieldKey = "key", fieldChildren = "children" }) => {
  // 无任何子结点
  if (isEmpty(nodes)) {
    return treeData;
  }
  // 若是刷新根结点
  if (!parentKey) {
    return nodes;
  }
  if (isEmpty(treeData)) {
    return nodes;
  }
  // 递归查找父类结点
  const parentNode = findNodeByKey(treeData, parentKey, { fieldKey, fieldChildren });
  // 未找到结果不做处理
  if (!parentNode) {
    return treeData;
  }
  parentNode[fieldChildren] = nodes;
  return treeData;
};
