#!/usr/bin/env node

import * as path from 'path'
import { Command } from 'commander'
import consola from 'consola'
import { setConfig } from '../config/index.js'
import { getAwemeId, getSecUserId } from '../utils/fetcher.js'
import { DouyinHandler } from '../handler/index.js'
import { DouyinDownloader } from '../downloader/index.js'

const program = new Command()

program
  .name('dy')
  .description('抖音视频/图集下载器')
  .version('0.1.0')

program
  .command('download <url>')
  .alias('d')
  .description('下载单个视频或图集')
  .option('-o, --output <path>', '下载目录', './downloads')
  .option('-c, --cookie <cookie>', 'Cookie')
  .option('--cover', '下载封面')
  .option('--music', '下载音乐')
  .option('--desc', '下载文案')
  .action(async (url: string, options: { output: string; cookie?: string; cover?: boolean; music?: boolean; desc?: boolean }) => {
    try {
      if (!options.cookie) {
        consola.error('请提供 cookie 参数: --cookie <cookie>')
        process.exit(1)
      }

      setConfig({
        downloadPath: options.output,
        cookie: options.cookie,
      })

      consola.start('解析链接...')
      const awemeId = await getAwemeId(url)
      consola.info(`作品ID: ${awemeId}`)

      consola.start('获取作品详情...')
      const handler = new DouyinHandler({ cookie: options.cookie })
      const postDetail = await handler.fetchOneVideo(awemeId)

      consola.info(`作者: ${postDetail.nickname}`)
      consola.info(`描述: ${(postDetail.desc || '').substring(0, 50)}...`)

      consola.start('开始下载...')
      const downloadPath = path.resolve(options.output)

      const downloader = new DouyinDownloader({
        cookie: options.cookie,
        downloadPath,
        naming: '{nickname}_{aweme_id}',
        folderize: false,
        cover: options.cover || false,
        music: options.music || false,
        desc: options.desc || false,
      })

      await downloader.createDownloadTasks(postDetail.toAwemeData(), downloadPath)
      consola.success('下载完成!')
    } catch (error) {
      consola.error('下载出错:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

program
  .command('user <url>')
  .alias('u')
  .description('下载用户主页作品')
  .option('-o, --output <path>', '下载目录', './downloads')
  .option('-n, --number <count>', '下载数量 (0 表示全部)', '0')
  .option('-c, --cookie <cookie>', 'Cookie')
  .option('--cover', '下载封面')
  .option('--music', '下载音乐')
  .option('--desc', '下载文案')
  .action(async (url: string, options: { output: string; number: string; cookie?: string; cover?: boolean; music?: boolean; desc?: boolean }) => {
    try {
      if (!options.cookie) {
        consola.error('请提供 cookie 参数: --cookie <cookie>')
        process.exit(1)
      }

      setConfig({
        downloadPath: options.output,
        cookie: options.cookie,
      })

      const maxCount = parseInt(options.number) || 0

      consola.start('解析用户链接...')
      const secUserId = await getSecUserId(url)
      consola.info(`用户ID: ${secUserId}`)

      const handler = new DouyinHandler({ cookie: options.cookie })
      const downloadPath = path.resolve(options.output)

      const downloader = new DouyinDownloader({
        cookie: options.cookie,
        downloadPath,
        naming: '{nickname}_{aweme_id}',
        folderize: false,
        cover: options.cover || false,
        music: options.music || false,
        desc: options.desc || false,
      })

      consola.start('开始下载用户作品...')
      let count = 0

      for await (const postFilter of handler.fetchUserPostVideos(secUserId, { maxCounts: maxCount })) {
        const awemeList = postFilter.toAwemeDataList()

        for (const awemeData of awemeList) {
          count++
          consola.info(`[${count}] 下载: ${awemeData.awemeId}`)

          await downloader.createDownloadTasks(awemeData, downloadPath)

          if (maxCount > 0 && count >= maxCount) break
        }

        if (maxCount > 0 && count >= maxCount) break
      }

      consola.success(`下载完成! 共 ${count} 个作品`)
    } catch (error) {
      consola.error('下载出错:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

program.parse()
