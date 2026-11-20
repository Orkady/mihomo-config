# mihomo-config

一份供 Clash Verge Rev（Windows、macOS）和 FlClash（Android）共用的 Mihomo 配置。三端订阅同一份 [main.yaml](main.yaml)，各自在本地脚本里填写机场地址。以 OpenAI 为例，请求先命中 `openai-domain` 规则，再交给 `AI服务` 策略组，具体用哪个节点由当前设备选择。

## 第一次使用

1. 在 GitHub 打开 `main.yaml`，点击 **Raw**，复制地址。在客户端用该地址添加一份远程配置。保留原先可用的配置，方便测试时切回。
2. 将 [空白脚本模板](inject-subscriptions.example.js) 复制到客户端的本地脚本编辑器。如果在磁盘上编辑，另存为 `inject-subscriptions.local.js`。**真实订阅地址只填在私密副本中。** 在 `const urls` 中，将 `airport-a` 和 `airport-b` 右侧的占位字符串分别换成对应的完整 HTTPS 订阅地址，保留引号和左侧标识。YAML 中 `https://example.invalid/…` 的占位地址保留原样。
3. **Clash Verge Rev** 在这张订阅卡片的菜单中打开「扩展脚本」，粘贴并保存私密副本。**FlClash** 在该配置的「扩展」中切换到「脚本」模式，创建或选中本地脚本并应用。每台设备绑定一次；重新创建配置卡片时需重新绑定。
4. 激活配置，选择**规则模式**，按设备需要开启系统代理或 VPN。更新 `airport-a`、`airport-b`，打开「机场A」「机场B」检查 `[A]`、`[B]` 节点。先在「全部节点」选一个可用节点测试普通网站，再测试服务分流。

## 日常改哪里

| 想做的事 | 修改位置 | 如何生效 |
| --- | --- | --- |
| 在已有选项间切换 AI 出口 | 当前设备的「AI服务」策略组 | 选地区组或「全部节点」，再在下一级选具体节点。其他设备独立选择 |
| 更换机场订阅地址或 token | 各端本地脚本的 `urls` | 保存、重新应用脚本并刷新对应 provider。若先在磁盘上编辑，也要把改动复制到客户端 |
| 调整某机场的节点显示名称 | `main.yaml` → `proxy-providers` → 对应机场 → `override.proxy-name` | 更新主配置。例如把 `Hong Kong` 替换为 `香港`；保留编号可区分同地区线路 |
| 修改地区组包含哪些节点 | `main.yaml` → `proxy-groups` → 对应地区的 `use` 和 `filter` | `use` 指定机场来源，`filter` 按节点名筛选。用实际节点名测试正则 |
| 调整网站分流、增删规则集 | `main.yaml` → `rules`、`rule-providers`，需要新组时再改 `proxy-groups` | 发布主配置，各端更新主订阅 |
| 机场更新节点，或上游规则库更新域名 | 沿用原地址 | 本配置每 6 小时更新节点、每 24 小时更新规则集；也可在客户端手动刷新 |

### 新增或删除机场

以新增 `airport-c` 为例，先在一台设备用**新的本地测试配置和对应脚本**配套验证：

1. 在 `main.yaml` 的 `proxy-providers` 下复制 `airport-b`，标识改为 `airport-c`，占位 URL 改为 `https://example.invalid/airport-c`，缓存路径改为 `./providers/airport-c.yaml`，前缀改为 `[C] `。
2. 在「全部节点」「自动选择」以及需要包含 C 的地区组中，把 `use` 改为 `[airport-a, airport-b, airport-c]`。如需单独选择机场 C，新增 `type: select`、`use: [airport-c]` 的「机场C」组，再将它加入「默认代理」的 `proxies`。
3. 在**本地脚本**的 `urls` 中添加同名的 `airport-c`，填入真实 HTTPS 地址。在**公开脚本模板**里只加 `"airport-c": "REPLACE_WITH_AIRPORT_C_URL"`，便于日后设置新设备。
4. 验证能看到 `[C]` 节点后发布公共文件。每台设备先取得新版主配置，再应用包含 C 的本地脚本并刷新 C。当前脚本会检查每个脚本键是否存在于主配置；提前把新版脚本应用到旧主配置会报「主配置缺少机场定义」。

删除机场时，同时清理 `use` 中的引用、专属组及上级组对它的引用，并删除 provider 定义。各端本地脚本先移除相同的键，再应用新版配置。公开模板也同步移除对应占位项。

### 修改分流

**只改一个网站**时，在 `rules` 的已有列表中加入一条规则，放在可能先匹配它的宽泛规则之前。例如要让 `example.org` 及其子域名走「AI服务」：

```yaml
  - DOMAIN-SUFFIX,example.org,AI服务
```

**调整整个服务**时，修改已有 `RULE-SET` 行的最后一项即可。例如要让 Anthropic 固定交给日本组，把原来的 `RULE-SET,anthropic-domain,AI服务` 改成 `RULE-SET,anthropic-domain,日本节点`。先在「日本节点」中选好真实节点；本配置的地区组有 `REJECT` 选项，选中它会拒绝连接。OpenAI 仍按自己的规则进入「AI服务」。

**接入新的远程规则集**时，先在 `rule-providers` 中声明唯一名称、公开下载 URL、独立缓存路径及更新周期，再在 `rules` 中加入 `RULE-SET,规则集名称,已有策略组名称`。按上游说明选择 `behavior` 和 `format`，例如本配置的域名 MRS 用 `domain` / `mrs`，IP MRS 用 `ipcidr` / `mrs`。规则从上往下匹配，`MATCH,默认代理` 留在最后。[规则数据来源](https://github.com/MetaCubeX/meta-rules-dat) · [Mihomo 规则集文档](https://wiki.metacubex.one/config/rule-providers/)

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
| 地区组只有 `REJECT` | 从「全部节点」核对实际名称，再调整该组 `filter` |
| 节点可用，但服务规则未命中 | 确认规则模式、规则顺序与规则集下载状态。本示例用 `DIRECT` 拉取 GitHub Raw；首次下载要求可直达上游，或使用可信的可达规则源。已有可用节点时，可仅将规则 provider 的 `proxy` 调整为可用策略组 |
| 想查看各机场剩余流量 | 刷新对应的代理 provider，查看客户端提供的订阅信息。能否显示取决于机场是否返回 `subscription-userinfo` 以及客户端界面支持情况 |
