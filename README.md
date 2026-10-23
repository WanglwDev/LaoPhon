# LaoPhon

[English](#english) · [中文](#中文)

## English

LaoPhon is an offline Lao-to-IPA tool for Windows and macOS. Segment Lao text, review syllable boundaries, and generate IPA with an editable variety profile.

### Downloads

Get the ready-to-use applications from the [latest release](https://github.com/WanglwDev/LaoPhon/releases/latest).

| Download | Platform |
| --- | --- |
| [LaoPhon-Windows-x64.zip](https://github.com/WanglwDev/LaoPhon/releases/latest/download/LaoPhon-Windows-x64.zip) | Windows 10 / 11, Intel or AMD 64-bit |
| [LaoPhon-macOS-arm64.zip](https://github.com/WanglwDev/LaoPhon/releases/latest/download/LaoPhon-macOS-arm64.zip) | macOS 13+, Apple silicon |
| [LaoPhon-macOS-x64.zip](https://github.com/WanglwDev/LaoPhon/releases/latest/download/LaoPhon-macOS-x64.zip) | macOS 13+, Intel |
| [LaoPhon-source-v2.0.1.zip](https://github.com/WanglwDev/LaoPhon/releases/download/v2.0.1/LaoPhon-source-v2.0.1.zip) | Source code, tests, and build instructions |

Extract the entire Windows archive before opening `LaoPhon.exe`; keep its resources and runtime files together. On macOS, extract the archive and open `LaoPhon.app`. No Node.js, Python, account, or internet connection is needed to use the packaged applications. See [USAGE.md](USAGE.md) for details.

### Features

- Switch between **中文 / English** in the upper-right header. The application remembers your choice locally.
- Start with Vientiane (万象), and add, edit, save, or switch your own variety profiles.
- Edit 15 tone categories and consonant, vowel, and final mappings; view the A/B/C/DS/DL and H/M/L reference table.
- Review segmentation, adjust boundaries with spaces, and save local corrections.
- Generate and copy IPA; clear stale output when text or segmentation changes.
- Use Saysettha OT for Lao and IPAPANNEW for IPA in the packaged applications.

All text and profile data are processed locally. Changing the interface language preserves input, IPA output, and user-defined profile names. Segmentation is a spelling-rule aid: ambiguous boundaries and unusual spellings still require manual review. A rule match does not verify pronunciation.

### Source and verification

The source code is available in this repository under [Apache-2.0](LICENSE). LaoNLP attribution is retained in [NOTICE](NOTICE) and [third-party notices](app/ui/THIRD_PARTY_NOTICES.md). Font binaries and the Electron runtime are separate dependencies and are not included in the source archive. Their own notices and licenses apply; see [BUILD.md](BUILD.md).

Source tests run with Node.js 22 or later:

```sh
npm test
```

The regression suite includes the original 61 assertions, controller and profile checks, 153 language-switch assertions, and syllable/correction checks. Packaged application source was checked for consistency across all three platforms.

The macOS applications use ad-hoc signatures. The Windows application is not commercially code-signed. Release assets include `SHA256SUMS.txt` for integrity checks.

The current macOS test build has not yet been notarized by Apple. If you see a message that the developer cannot be verified when opening it for the first time, confirm that the package came from this page, then go to **System Settings → Privacy & Security → Open Anyway**.

## 中文

LaoPhon 是可离线使用的老挝文转国际音标工具，提供 Windows 和 macOS 版本。输入老挝文，核对音节边界，再根据可编辑的语言点方案生成 IPA。

### 下载

请从 [最新发布页](https://github.com/WanglwDev/LaoPhon/releases/latest) 下载适合电脑的文件。

| 下载文件 | 适用电脑 |
| --- | --- |
| [LaoPhon-Windows-x64.zip](https://github.com/WanglwDev/LaoPhon/releases/latest/download/LaoPhon-Windows-x64.zip) | Windows 10 / 11，Intel 或 AMD 64 位 |
| [LaoPhon-macOS-arm64.zip](https://github.com/WanglwDev/LaoPhon/releases/latest/download/LaoPhon-macOS-arm64.zip) | macOS 13 或更新，Apple 芯片 |
| [LaoPhon-macOS-x64.zip](https://github.com/WanglwDev/LaoPhon/releases/latest/download/LaoPhon-macOS-x64.zip) | macOS 13 或更新，Intel 芯片 |
| [LaoPhon-source-v2.0.1.zip](https://github.com/WanglwDev/LaoPhon/releases/download/v2.0.1/LaoPhon-source-v2.0.1.zip) | 源码、测试与构建说明 |

Windows 请完整解压后打开 `LaoPhon.exe`，保留同目录全部资源和运行库；Mac 解压后打开 `LaoPhon.app`。使用打包后的软件无需安装 Node.js、Python，也无需账号或联网。详细步骤见 [USAGE.md](USAGE.md)。

### 功能

- 页首右侧提供 **中文 / English**，在本机记住上次选择。
- 首次仅预置万象语言点，仍可新增、编辑、保存和切换自己的方案。
- 编辑 15 个调类及辅音、元音、韵尾映射，查看 A/B/C/DS/DL 和 H/M/L 说明图表。
- 辅助拆分音节，以空格手动调整边界，并保存本机校正词条。
- 生成和复制 IPA；修改输入或切分后清除过期结果。
- 软件包中的老挝文使用 Saysettha OT，IPA 使用 IPAPANNEW。

文本与方案数据均在本地处理。切换界面语言不会改变输入、IPA 结果或用户自定的方案名称。切分基于拼写规则，歧义边界和特殊拼写仍需人工确认；规则匹配不表示读音已核验。

### 源码与验证

仓库源码采用 [Apache-2.0](LICENSE) 许可，保留 [NOTICE](NOTICE) 及 [第三方声明](app/ui/THIRD_PARTY_NOTICES.md) 中的 LaoNLP 署名。源码包不包含字体二进制文件与 Electron 运行库；这些独立依赖适用各自声明和许可，详见 [BUILD.md](BUILD.md)。

安装 Node.js 22 或更新版本后运行源码测试：

```sh
npm test
```

测试涵盖原有 61 项断言、界面控制器与方案检查、153 项语言切换断言，以及音节和校正检查。三个软件包内的应用源码已检查一致性。

Mac 使用 ad-hoc 签名；Windows 未做商业代码签名。发布附件提供 `SHA256SUMS.txt` 供校验。

macOS当前测试版尚未通过 Apple 公证。首次打开若提示无法验证开发者，确认安装包来自本页面后，可进入 **系统设置 → 隐私与安全性 → 仍要打开**。

Developed by Wang Linwei | © 2026
