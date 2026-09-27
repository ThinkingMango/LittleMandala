import type { TemplateDefinition } from '@/lib/mandalas'
import cheetahNap from '@/lib/templates/safari-garden/cheetah-nap.json'
import chameleonCurl from '@/lib/templates/safari-garden/chameleon-curl.json'
import elephantShower from '@/lib/templates/safari-garden/elephant-shower.json'
import flamingoPond from '@/lib/templates/safari-garden/flamingo-pond.json'
import giraffeGarden from '@/lib/templates/safari-garden/giraffe-garden.json'
import gorillaFlower from '@/lib/templates/safari-garden/gorilla-flower.json'
import hippoLilypad from '@/lib/templates/safari-garden/hippo-lilypad.json'
import lionBloom from '@/lib/templates/safari-garden/lion-bloom.json'
import meerkatLookout from '@/lib/templates/safari-garden/meerkat-lookout.json'
import monkeyVine from '@/lib/templates/safari-garden/monkey-vine.json'
import ostrichStrut from '@/lib/templates/safari-garden/ostrich-strut.json'
import parrotPerch from '@/lib/templates/safari-garden/parrot-perch.json'
import rhinoFriend from '@/lib/templates/safari-garden/rhino-friend.json'
import tortoiseTrail from '@/lib/templates/safari-garden/tortoise-trail.json'
import toucanTreetop from '@/lib/templates/safari-garden/toucan-treetop.json'
import zebraMeadow from '@/lib/templates/safari-garden/zebra-meadow.json'
import { tracedPage } from '@/lib/templates/traced'

export const SAFARI_GARDEN: TemplateDefinition[] = [
  lionBloom,
  giraffeGarden,
  elephantShower,
  zebraMeadow,
  hippoLilypad,
  monkeyVine,
  rhinoFriend,
  cheetahNap,
  parrotPerch,
  flamingoPond,
  meerkatLookout,
  tortoiseTrail,
  toucanTreetop,
  gorillaFlower,
  chameleonCurl,
  ostrichStrut,
].map((art) => tracedPage('safari-garden', art))
