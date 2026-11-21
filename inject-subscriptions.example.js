// 公开模板：不要在此文件填写真实机场地址。
// 填写后的副本请命名为 inject-subscriptions.local.js，仅保存到客户端本地。

function main(config) {
  const urls = {
    "airport-a": "REPLACE_WITH_AIRPORT_A_URL",
    "airport-b": "REPLACE_WITH_AIRPORT_B_URL"
  };

  // 只改右边的显示名，左边与主配置中的原组名对应。
  const airportNames = { "机场A": "机场A", "机场B": "机场B" };

  const providers = config["proxy-providers"];
  if (!providers || typeof providers !== "object") {
    throw new Error("主配置缺少 proxy-providers，停止应用");
  }

  for (const name of Object.keys(urls)) {
    if (!Object.prototype.hasOwnProperty.call(providers, name)) {
      throw new Error("主配置缺少机场定义：" + name);
    }
    if (typeof urls[name] !== "string" ||
        !/^https:\/\//i.test(urls[name]) ||
        /example\.invalid/i.test(urls[name])) {
      throw new Error("请在本地填写真实 HTTPS 订阅地址：" + name);
    }
  }

  for (const name of Object.keys(urls)) {
    providers[name].url = urls[name];
  }
  const groups = config["proxy-groups"] || [];
  const rename = name => Object.prototype.hasOwnProperty.call(airportNames, name)
    ? airportNames[name].trim() : name;
  const names = groups.map(group => rename(group.name));
  const reserved = ["DIRECT", "REJECT", "REJECT-DROP", "PASS", "COMPATIBLE", "GLOBAL"];
  if (new Set(names).size !== names.length || Object.values(airportNames).some(name =>
    !name.trim() || reserved.includes(name.trim()) || /[,\r\n]/.test(name))) {
    throw new Error("机场显示名不能为空、重复、使用内置名称或含逗号和换行");
  }
  for (const group of groups) {
    const displayName = rename(group.name);
    if (Object.prototype.hasOwnProperty.call(airportNames, group.name) &&
        Array.isArray(group.use) && group.use.length === 1) {
      const provider = providers[group.use[0]];
      if (provider) {
        provider.override = provider.override || {};
        provider.override["additional-prefix"] = "「" + displayName + "」 ";
      }
    }
    group.name = displayName;
    if (Array.isArray(group.proxies)) group.proxies = group.proxies.map(rename);
  }

  return config;
}
