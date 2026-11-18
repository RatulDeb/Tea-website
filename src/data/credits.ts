export interface ImageCredit {
  file: string
  title: string
  creator: string
  license: string
  licenseUrl: string
  source: string
}

const licenseUrls = {
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
  'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/',
  CC0: 'https://creativecommons.org/publicdomain/zero/1.0/',
  'Public domain': 'https://creativecommons.org/publicdomain/mark/1.0/',
}

function credit(
  file: string,
  title: string,
  creator: string,
  license: keyof typeof licenseUrls,
  source: string,
): ImageCredit {
  return { file, title, creator, license, licenseUrl: licenseUrls[license], source }
}

export const imageCredits: ImageCredit[] = [
  credit(
    'assam-black-tea.jpg',
    'Assam tea (1).jpg',
    'Gogerr',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:Assam_tea_(1).jpg',
  ),
  credit(
    'darjeeling-black-tea.jpg',
    'Nice Cup of Black Tea.jpg',
    'Vanderdecken, David J. Fred, and Ian Smith',
    'CC BY-SA 3.0',
    'https://commons.wikimedia.org/wiki/File:Nice_Cup_of_Black_Tea.jpg',
  ),
  credit(
    'earl-grey.jpg',
    'Earl Grey Tea.jpg',
    'Sebastian Stabinger',
    'CC BY 3.0',
    'https://commons.wikimedia.org/wiki/File:Earl_Grey_Tea.jpg',
  ),
  credit(
    'english-breakfast.jpg',
    'English breakfast tea, Marrickville, Sydney.jpg',
    'ashishlohorung',
    'CC BY-SA 3.0',
    'https://commons.wikimedia.org/wiki/File:English_breakfast_tea,_Marrickville,_Sydney.jpg',
  ),
  credit(
    'masala-chai.jpg',
    'Masala Chai.JPG',
    'Miansari66',
    'Public domain',
    'https://commons.wikimedia.org/wiki/File:Masala_Chai.JPG',
  ),
  credit(
    'sencha-green-tea.jpg',
    '00122615-Sencha-tea-Leaves.jpg',
    'El mosati',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:00122615-Sencha-tea-Leaves.jpg',
  ),
  credit(
    'jasmine-green-tea.jpg',
    'Jasmine Tea blossomed.jpg',
    'Hellstorm',
    'CC BY-SA 3.0',
    'https://commons.wikimedia.org/wiki/File:Jasmine_Tea_blossomed.jpg',
  ),
  credit(
    'matcha.jpg',
    'Matcha Scoop.jpg',
    'Evanhoever',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:Matcha_Scoop.jpg',
  ),
  credit(
    'moroccan-mint-green-tea.jpg',
    'Moroccan Mint Tea - 1.jpg',
    'Sarkar Sayantan',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:Moroccan_Mint_Tea_-_1.jpg',
  ),
  credit(
    'longjing-green-tea.jpg',
    'Longjing tea.jpg',
    'Difference engine',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:Longjing_tea.jpg',
  ),
  credit(
    'silver-needle-white-tea.jpg',
    '2010 FirstFlush Yunnan Baihao Yinzhen.jpg',
    'Kaminix',
    'Public domain',
    'https://commons.wikimedia.org/wiki/File:2010_FirstFlush_Yunnan_Baihao_Yinzhen.jpg',
  ),
  credit(
    'white-peony-tea.jpg',
    'Weißer Tee Pai Mu Tan.jpg',
    'André Helbig, soultea.de',
    'CC BY-SA 3.0',
    'https://commons.wikimedia.org/wiki/File:Wei%C3%9Fer_Tee_Pai_Mu_Tan.jpg',
  ),
  credit(
    'tieguanyin-oolong.jpg',
    'Fulles de Tieguanyin.jpg',
    'Francesc Fort',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:Fulles_de_Tieguanyin.jpg',
  ),
  credit(
    'milk-oolong.jpg',
    'Jin Xuan oolong tea.jpg',
    'Difference engine',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:Jin_Xuan_oolong_tea.jpg',
  ),
  credit(
    'pu-erh-tea.jpg',
    'Yunnan Sourcing "Golden Pig" Raw Pu-erh Tea Cake - opened - WikiTea 01.jpg',
    'Ash Crow',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:Yunnan_Sourcing_%22Golden_Pig%22_Raw_Pu-erh_Tea_Cake_-_opened_-_WikiTea_01.jpg',
  ),
  credit(
    'rooibos.jpg',
    'Rooibos geschnitten.jpg',
    'André Helbig, soultea.de',
    'CC BY-SA 3.0',
    'https://commons.wikimedia.org/wiki/File:Rooibos_geschnitten.jpg',
  ),
  credit(
    'chamomile.jpg',
    'German chamomile in flower.jpg',
    'Lavinia Engelbrecht',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:German_chamomile_in_flower.jpg',
  ),
  credit(
    'peppermint.jpg',
    'Dried mint leaves tea.jpg',
    'Fumikas Sagisavas',
    'CC0',
    'https://commons.wikimedia.org/wiki/File:Dried_mint_leaves_tea.jpg',
  ),
  credit(
    'hibiscus.jpg',
    'Chai torsh - Hibiscus tea.png',
    'MRG90',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:Chai_torsh_-_Hibiscus_tea.png',
  ),
  credit(
    'ginger-lemongrass.jpg',
    'Lemongrass ginger tea.jpg',
    'AyyanD',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:Lemongrass_ginger_tea.jpg',
  ),
  credit(
    'tea-garden-hero.jpg',
    'Sunset & Tea Garden.jpg',
    'Ameet Ranjit Photography',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:Sunset_%26_Tea_Garden.jpg',
  ),
]

export const imageCreditNote =
  'Photographs are from Wikimedia Commons and remain under the licenses shown. Images have been cropped and resized for this demo. Product photography is illustrative; please replace it with your own packshots before launch.'
