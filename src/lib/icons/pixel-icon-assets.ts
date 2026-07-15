import skull from 'pixelarticons/svg/skull.svg?url';
import bookOpen from 'pixelarticons/svg/book-open.svg?url';
import mail from 'pixelarticons/svg/mail.svg?url';
import terminal from 'pixelarticons/svg/terminal.svg?url';
import cpu from 'pixelarticons/svg/cpu.svg?url';
import script from 'pixelarticons/svg/script.svg?url';
import bug from 'pixelarticons/svg/bug.svg?url';
import arrowRight from 'pixelarticons/svg/arrow-right.svg?url';
import moon from 'pixelarticons/svg/moon.svg?url';
import radio from 'pixelarticons/svg/radio.svg?url';
import rss from 'pixelarticons/svg/rss.svg?url';
import article from 'pixelarticons/svg/article.svg?url';
import plus from 'pixelarticons/svg/plus.svg?url';
import folder from 'pixelarticons/svg/folder.svg?url';
import externalLink from 'pixelarticons/svg/external-link.svg?url';
import logout from 'pixelarticons/svg/logout.svg?url';
import menu from 'pixelarticons/svg/menu.svg?url';
import close from 'pixelarticons/svg/close.svg?url';
import moreVertical from 'pixelarticons/svg/more-vertical.svg?url';
import pencil from 'pixelarticons/svg/pencil.svg?url';
import send from 'pixelarticons/svg/send.svg?url';
import archive from 'pixelarticons/svg/archive.svg?url';
import trash from 'pixelarticons/svg/trash.svg?url';
import eye from 'pixelarticons/svg/eye.svg?url';
import check from 'pixelarticons/svg/check.svg?url';
import save from 'pixelarticons/svg/save.svg?url';

import type { IconName } from './icon-names';

export const PIXEL_ICON_ASSETS = {
  skull,
  'book-open': bookOpen,
  mail,
  terminal,
  cpu,
  script,
  bug,
  'arrow-right': arrowRight,
  moon,
  radio,
  rss,
  article,
  plus,
  folder,
  'external-link': externalLink,
  logout,
  menu,
  close,
  'more-vertical': moreVertical,
  pencil,
  send,
  archive,
  trash,
  eye,
  check,
  save
} satisfies Record<IconName, string>;
