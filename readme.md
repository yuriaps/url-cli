# url-cli

> URL encode & decode a string, right from your terminal.

Fork of [k4m4/url-cli](https://github.com/k4m4/url-cli) by [Nikolaos Kamarinakis](https://nikolaskama.me), with Burp Suite style encoding (key characters by default, all characters with `-A`).

---

## Install

This fork is not published on npm, so install it straight from GitHub:

```
~ ❯❯❯ npm install -g github:yuriaps/url-cli
```

Or from a local clone:

```
~ ❯❯❯ git clone https://github.com/yuriaps/url-cli.git
~ ❯❯❯ cd url-cli
~ ❯❯❯ npm install -g .
```


## Requirements

Node.js 20 or newer. No runtime dependencies.


## Usage

```
  URL encode & decode a string, right from your terminal.

  Usage
    ~ ❯❯❯ url [string]
    ~ ❯❯❯ echo [string] | url
  Options
    -A, --all     Encode all characters, not only key ones
    -d, --decode  Decode URL encoded string
    -p, --plain   Display output without log symbols
  Examples
    ~ ❯❯❯ url "just 4n0ther URL enc0d3d $tr1ng"
    just+4n0ther+URL+enc0d3d+$tr1ng
    ~ ❯❯❯ url -A "~ola a b.*"
    %7e%6f%6c%61%20%61%20%62%2e%2a
    ~ ❯❯❯ url -d url%E2%80%93encoded%20string
    url–encoded string
```


## License

- MIT © [Nikolaos Kamarinakis](https://nikolaskama.me) (original work)
- MIT © [Yuri Lihomanof](https://github.com/yuriaps) (modifications in this fork)

See [license](license) for the full text.