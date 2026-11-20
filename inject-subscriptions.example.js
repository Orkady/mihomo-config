// 公开模板：不要在此文件填写真实机场地址。
// 填写后的副本请命名为 inject-subscriptions.local.js，仅保存到客户端本地。

function main(config) {
  const urls = {
    "airport-a": "REPLACE_WITH_AIRPORT_A_URL",
    "airport-b": "REPLACE_WITH_AIRPORT_B_URL"
  };

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
  return config;
}
