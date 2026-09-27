import type { TemplateDefinition } from '@/lib/mandalas'
import bellsBow from '@/lib/templates/christmas-garden/bells-bow.json'
import foxLantern from '@/lib/templates/christmas-garden/fox-lantern.json'
import gingerbreadFriend from '@/lib/templates/christmas-garden/gingerbread-friend.json'
import gingerbreadHouse from '@/lib/templates/christmas-garden/gingerbread-house.json'
import hollyWreath from '@/lib/templates/christmas-garden/holly-wreath.json'
import ornamentBloom from '@/lib/templates/christmas-garden/ornament-bloom.json'
import penguinGift from '@/lib/templates/christmas-garden/penguin-gift.json'
import poinsettiaBloom from '@/lib/templates/christmas-garden/poinsettia-bloom.json'
import polarBearCocoa from '@/lib/templates/christmas-garden/polar-bear-cocoa.json'
import reindeerBells from '@/lib/templates/christmas-garden/reindeer-bells.json'
import robinHolly from '@/lib/templates/christmas-garden/robin-holly.json'
import sleighGifts from '@/lib/templates/christmas-garden/sleigh-gifts.json'
import snowGlobe from '@/lib/templates/christmas-garden/snow-globe.json'
import snowmanScarf from '@/lib/templates/christmas-garden/snowman-scarf.json'
import stockingPair from '@/lib/templates/christmas-garden/stocking-pair.json'
import treeStar from '@/lib/templates/christmas-garden/tree-star.json'
import { tracedPage } from '@/lib/templates/traced'

export const CHRISTMAS_GARDEN: TemplateDefinition[] = [
  treeStar,
  snowmanScarf,
  reindeerBells,
  gingerbreadHouse,
  penguinGift,
  poinsettiaBloom,
  stockingPair,
  hollyWreath,
  robinHolly,
  sleighGifts,
  polarBearCocoa,
  snowGlobe,
  gingerbreadFriend,
  bellsBow,
  ornamentBloom,
  foxLantern,
].map((art) => tracedPage('christmas-garden', art))
