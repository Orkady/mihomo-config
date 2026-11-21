# mihomo-config

一份供 Clash Verge Rev（Windows、macOS）和 FlClash（Android）共用的 Mihomo 配置。三端订阅同一份 [main.yaml](main.yaml)，各自在本地脚本里填写机场地址。分流与地区筛选采用 [Aethersailor Full](https://github.com/Aethersailor/Custom_OpenClash_Rules/blob/main/cfg/yaml/Custom_Clash_Full.yaml)，彩色图标参考 [powerfullz](https://github.com/powerfullz/override-rules/blob/main/src/catalog/icons.ts) 和 [Qure](https://github.com/Koolson/Qure)。OpenAI 域名进入 `🤖 ChatGPT`，Anthropic 进入 `✴️ Claude`，各设备独立选择出口。

## 第一次使用

1. 在 GitHub 打开 `main.yaml`，点击 **Raw**，复制地址。在客户端用该地址添加一份远程配置。保留原先可用的配置，方便测试时切回。
2. 将 [空白脚本模板](inject-subscriptions.example.js) 复制到客户端的本地脚本编辑器。如果在磁盘上编辑，另存为 `inject-subscriptions.local.js`。**真实订阅地址只填在私密副本中。** 在 `const urls` 中，将 `airport-a` 和 `airport-b` 右侧的占位字符串分别换成对应的完整 HTTPS 订阅地址，保留引号和左侧标识。YAML 中 `https://example.invalid/…` 的占位地址保留原样。
3. **Clash Verge Rev** 在这张订阅卡片的菜单中打开「扩展脚本」，粘贴并保存私密副本。**FlClash** 在该配置的「扩展」中切换到「脚本」模式，创建或选中本地脚本并应用。每台设备绑定一次；重新创建配置卡片时需重新绑定。
4. 激活配置，选择**规则模式**，按设备需要开启系统代理或 VPN。更新 `airport-a`、`airport-b`，打开各机场组，检查节点名前的 `[机场显示名]`。在「🚀 手动选择」选可用节点或地区组，再到具体服务组设置例外。

## 日常改哪里

| 想做的事 | 修改位置 | 如何生效 |
| --- | --- | --- |
| 在已有选项间切换 AI 出口 | 当前设备的「🤖 ChatGPT」「✴️ Claude」「✨ Gemini」等组 | 可固定具体节点，或交给地区组自动测速 |
| 给机场策略组改名 | 各端本地脚本的 `airportNames` | 保留左侧原组名，只改右侧显示名。重新应用后，机场组、上级菜单和该机场所有节点的 `[显示名]` 前缀一起更新 |
| 更换机场订阅地址或 token | 各端本地脚本的 `urls` | 保存、重新应用脚本并刷新对应 provider。若先在磁盘上编辑，也要把改动复制到客户端 |
| 统一节点显示名称 | `proxy-providers.airport-a.override.proxy-name` 的 `&region_labels` | A/B 共用改名表。`HK01` 默认显示为 `[机场A] 🇭🇰 香港·HK01`。已有地区旗帜时保留原旗；无旗时按可识别的地区名或缩写补旗 |
| 调整地区匹配 | `main.yaml` → `proxy-groups` → 对应地区的 `filter` 和「🌐 其他地区」的 `exclude-filter` | 地区固定按香港、美国、日本、新加坡、台湾、其他地区排列。有旗帜时按旗帜匹配，无旗帜时按名称匹配。修改前五组时同步更新「其他地区」的排除条件 |
| 调整网站分流、增删规则集 | `main.yaml` → `rules`、`rule-providers`，需要新组时再改 `proxy-groups` | 发布主配置，各端更新主订阅 |
| 机场更新节点，或上游规则库更新域名 | 沿用原地址 | 本配置每 6 小时更新节点、每 8 小时更新 Full 的远程规则集，每 24 小时检查地理数据更新；也可在客户端手动刷新 |

### 新增或删除机场

以新增 `airport-c` 为例，先在一台设备用**新的本地测试配置和对应脚本**配套验证：

1. 在 `main.yaml` 的 `proxy-providers` 下复制 `airport-b`，标识改为 `airport-c`，占位 URL 改为 `https://example.invalid/airport-c`，缓存路径改为 `./providers/airport-c.yaml`，前缀改为 `[C] `。
2. 服务组和地区组通过 `include-all-providers: true` 自动纳入新来源。如需单独选机场 C，复制「机场B」组，改为「机场C」和 `use: [airport-c]`，再加入「🚀 手动选择」的 `proxies`。
3. 在**本地脚本**的 `urls` 中添加同名的 `airport-c`，填入真实 HTTPS 地址。要同步自定义新增机场的组名和节点前缀，在 `airportNames` 增加 `"机场C": "自选显示名"`。在**公开脚本模板**里只加 `"airport-c": "REPLACE_WITH_AIRPORT_C_URL"`，便于日后设置新设备。
4. 验证能看到机场 C 对应前缀的节点后发布公共文件。每台设备先取得新版主配置，再应用包含 C 的本地脚本并刷新 C。当前脚本会检查每个脚本键是否存在于主配置；提前把新版脚本应用到旧主配置会报「主配置缺少机场定义」。

删除机场时，同时清理 `use` 中的引用、专属组及上级组对它的引用，并删除 provider 定义。各端本地脚本先移除相同的键，再应用新版配置。公开模板也同步移除对应占位项。

### 修改分流

**只改一个网站**时，在 `rules` 的已有列表中加入一条规则，放在可能先匹配它的宽泛规则之前。例如要让 `example.org` 及其子域名走学术出口：

```yaml
  - DOMAIN-SUFFIX,example.org,📚 学术资源
```

**调整整个服务**时，先在服务组中切换。例如在「✴️ Claude」选择「🇯🇵 日本节点」，即可让 Anthropic 使用日本地区的自动测速结果。需要稳定出口时可以直接选具体节点。

**接入新的远程规则集**时，先在 `rule-providers` 中声明唯一名称、公开下载 URL、独立缓存路径及更新周期，再在 `rules` 中加入 `RULE-SET,规则集名称,已有策略组名称`。按上游说明选择 `behavior` 和 `format`，例如本配置的域名 MRS 用 `domain` / `mrs`，IP MRS 用 `ipcidr` / `mrs`。规则从上往下匹配，`MATCH,🐟 漏网之鱼` 留在最后。[规则数据来源](https://github.com/MetaCubeX/meta-rules-dat) · [Mihomo 规则集文档](https://wiki.metacubex.one/config/rule-providers/)

## 发布与验证

先在一台设备验证修改。在客户端的「连接」页面新建一次目标网站连接，检查**命中规则 → 策略组 → 实际节点**。确认后，从仓库根目录显式暂存本次修改的公共文件。例如只修改分流时：

```bash
git add -- main.yaml
git diff --cached --name-only
git diff --cached -- main.yaml
git commit -m "调整服务分流"
git push
```

推送后，各端更新原来的远程主配置。需要回退已发布的独立配置提交时，可用 `git revert <提交号>` 创建回退提交，再推送、刷新。

**公开前检查**：暂存列表只应含本次打算发布的公共文件。`.gitignore` 中的 `*.local.*` 用于忽略本地私密脚本；从网页上传时也要逐文件选择。客户端导出的最终配置、provider 缓存和完整日志可能含订阅 token 或节点凭据，请保存在本地。若凭据已经公开，先在机场端轮换相应凭据，并更新各端脚本；历史提交仍可能保留旧值。

## 快速排查

| 现象 | 先检查 |
| --- | --- |
| 日志出现 `example.invalid` 或两个机场均为空 | 确认当前卡片已绑定本地脚本，键名与 YAML 一致，脚本已保存并重新应用 |
| 只有一个机场更新失败 | 在该 provider 的更新日志中查看 HTTP 或解析错误，核对本地地址及机场提供的订阅格式 |
| 地区组只有 `REJECT` | 从「机场A」「机场B」核对实际名称，再调整该组 `filter` |
| 节点可用，但服务规则未命中 | 确认规则模式、规则顺序、`geosite.dat` / `geoip.dat` 及 8 个远程规则集的下载状态。首次使用需要可访问的数据源或客户端已有的兼容缓存 |
| 想查看各机场剩余流量 | 刷新对应的代理 provider，查看客户端提供的订阅信息。能否显示取决于机场是否返回 `subscription-userinfo` 以及客户端界面支持情况 |
