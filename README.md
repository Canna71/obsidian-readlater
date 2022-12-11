# Obsidian Read Later

Plugin for keeping and tracking offsite version of web pages

- Download a page to markdown
- integrate with read-it-later services like [Pocket](https://getpocket.com) and [Instapaper](https://www.instapaper.com)
- Map a note to a web page and keep it in synch

## Download or update a page to markdown 

Use a [bookmarklet](https://canna71.github.io/obsidian-readlater/)

Use the command `Save URL from Clipboard`

Set the `url` attribute in the frontmatter and use the command `Synch current page`

## Integrate with read-it-later Services
Go to the settings and authorize the plugin to access either your Pocket or Instapaper Library. Optionally set a periodic synching and a custom folder for each service.

You can force the Synch with the commands
`Synch Pocket Unread List`
or
`Synch Instapaper Unread List`

The plugin will fetch the bookmarks from the services and store them as markdown notes.
It will optionally keep it in synch by periodically fetching new bookmarks.

You can also "archive" the bookmarks from the corresponding notes.

## Automatic synch
If you want your note to be kept in synch with the online version, simply set the `synch` attribute:
```
---
url: https://time.is/
readlater:
  synch: Hourly
  synchtime: 1670768616110
---
```

`synch` attribute can take the following values: `Manual` (default), `Hourly`, `Daily`, `Weekly`, `Monthly`, `Yearly`



