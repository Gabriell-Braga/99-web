import type { ReactElement, SVGProps } from "react";

import Add from "@material-symbols/svg-400/rounded/add.svg";
import ArrowBack from "@material-symbols/svg-400/rounded/arrow_back.svg";
import ArrowForward from "@material-symbols/svg-400/rounded/arrow_forward.svg";
import Bolt from "@material-symbols/svg-400/rounded/bolt.svg";
import Check from "@material-symbols/svg-400/rounded/check.svg";
import ChevronLeft from "@material-symbols/svg-400/rounded/chevron_left.svg";
import ChevronRight from "@material-symbols/svg-400/rounded/chevron_right.svg";
import Close from "@material-symbols/svg-400/rounded/close.svg";
import ConfirmationNumber from "@material-symbols/svg-400/rounded/confirmation_number.svg";
import ContentCopy from "@material-symbols/svg-400/rounded/content_copy.svg";
import CreditCard from "@material-symbols/svg-400/rounded/credit_card.svg";
import Delete from "@material-symbols/svg-400/rounded/delete.svg";
import DirectionsCar from "@material-symbols/svg-400/rounded/directions_car.svg";
import ErrorIcon from "@material-symbols/svg-400/rounded/error.svg";
import Handshake from "@material-symbols/svg-400/rounded/handshake.svg";
import Home from "@material-symbols/svg-400/rounded/home.svg";
import Info from "@material-symbols/svg-400/rounded/info.svg";
import KeyboardArrowDown from "@material-symbols/svg-400/rounded/keyboard_arrow_down.svg";
import LocalFireDepartment from "@material-symbols/svg-400/rounded/local_fire_department.svg";
import LocationOn from "@material-symbols/svg-400/rounded/location_on.svg";
import MyLocation from "@material-symbols/svg-400/rounded/my_location.svg";
import Package2 from "@material-symbols/svg-400/rounded/package_2.svg";
import Park from "@material-symbols/svg-400/rounded/park.svg";
import Payments from "@material-symbols/svg-400/rounded/payments.svg";
import Person from "@material-symbols/svg-400/rounded/person.svg";
import ReceiptLong from "@material-symbols/svg-400/rounded/receipt_long.svg";
import Refresh from "@material-symbols/svg-400/rounded/refresh.svg";
import Remove from "@material-symbols/svg-400/rounded/remove.svg";
import Restaurant from "@material-symbols/svg-400/rounded/restaurant.svg";
import Schedule from "@material-symbols/svg-400/rounded/schedule.svg";
import Search from "@material-symbols/svg-400/rounded/search.svg";
import Sell from "@material-symbols/svg-400/rounded/sell.svg";
import ShoppingCart from "@material-symbols/svg-400/rounded/shopping_cart.svg";
import SkipNext from "@material-symbols/svg-400/rounded/skip_next.svg";
import Star from "@material-symbols/svg-400/rounded/star.svg";
import SwapVert from "@material-symbols/svg-400/rounded/swap_vert.svg";
import Wallet from "@material-symbols/svg-400/rounded/wallet.svg";
import Work from "@material-symbols/svg-400/rounded/work.svg";

type Glyph = (props: SVGProps<SVGSVGElement>) => ReactElement;

/**
 * Material Symbols Rounded, peso 400, grau 0, tamanho óptico 24, sem
 * preenchimento. Uma família só em todo o projeto, sem ícone desenhado à mão.
 * "coupon" usa `sell`, nome atual do antigo `local_offer`.
 */
const icons = {
  alert: ErrorIcon,
  arrowLeft: ArrowBack,
  arrowRight: ArrowForward,
  bolt: Bolt,
  box: Package2,
  briefcase: Work,
  car: DirectionsCar,
  card: CreditCard,
  cart: ShoppingCart,
  cash: Payments,
  check: Check,
  chevronDown: KeyboardArrowDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  clock: Schedule,
  copy: ContentCopy,
  coupon: Sell,
  flame: LocalFireDepartment,
  handshake: Handshake,
  home: Home,
  info: Info,
  minus: Remove,
  pin: LocationOn,
  plus: Add,
  receipt: ReceiptLong,
  refresh: Refresh,
  search: Search,
  skipForward: SkipNext,
  star: Star,
  swap: SwapVert,
  target: MyLocation,
  ticket: ConfirmationNumber,
  trash: Delete,
  tree: Park,
  user: Person,
  utensils: Restaurant,
  wallet: Wallet,
  x: Close,
} satisfies Record<string, Glyph>;

export type IconName = keyof typeof icons;

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, ...rest }: IconProps) {
  const Glyph = icons[name];
  return <Glyph width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false" {...rest} />;
}
