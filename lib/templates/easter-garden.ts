import type { TemplateDefinition } from '@/lib/mandalas'
import beeBlossom from '@/lib/templates/easter-garden/bee-blossom.json'
import bunnyBloom from '@/lib/templates/easter-garden/bunny-bloom.json'
import bunnyWagon from '@/lib/templates/easter-garden/bunny-wagon.json'
import butterflyGarden from '@/lib/templates/easter-garden/butterfly-garden.json'
import carrotPatch from '@/lib/templates/easter-garden/carrot-patch.json'
import chickHatch from '@/lib/templates/easter-garden/chick-hatch.json'
import ducklingPuddle from '@/lib/templates/easter-garden/duckling-puddle.json'
import eggBalloon from '@/lib/templates/easter-garden/egg-balloon.json'
import eggBasket from '@/lib/templates/easter-garden/egg-basket.json'
import eggHunt from '@/lib/templates/easter-garden/egg-hunt.json'
import henNest from '@/lib/templates/easter-garden/hen-nest.json'
import lambMeadow from '@/lib/templates/easter-garden/lamb-meadow.json'
import paintedEgg from '@/lib/templates/easter-garden/painted-egg.json'
import snailDaisy from '@/lib/templates/easter-garden/snail-daisy.json'
import springWreath from '@/lib/templates/easter-garden/spring-wreath.json'
import tulipPot from '@/lib/templates/easter-garden/tulip-pot.json'
import { tracedPage } from '@/lib/templates/traced'

export const EASTER_GARDEN: TemplateDefinition[] = [
  bunnyBloom,
  eggBasket,
  chickHatch,
  paintedEgg,
  lambMeadow,
  tulipPot,
  ducklingPuddle,
  butterflyGarden,
  carrotPatch,
  eggHunt,
  henNest,
  springWreath,
  bunnyWagon,
  snailDaisy,
  beeBlossom,
  eggBalloon,
].map((art) => tracedPage('easter-garden', art))
