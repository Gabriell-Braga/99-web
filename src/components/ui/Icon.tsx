import type { ReactElement, SVGProps } from "react";

import Add from "@material-symbols/svg-600/rounded/add.svg";
import ArrowBack from "@material-symbols/svg-600/rounded/arrow_back.svg";
import ArrowForward from "@material-symbols/svg-600/rounded/arrow_forward.svg";
import BoltFill from "@material-symbols/svg-600/rounded/bolt-fill.svg";
import Check from "@material-symbols/svg-600/rounded/check.svg";
import ChevronLeft from "@material-symbols/svg-600/rounded/chevron_left.svg";
import ChevronRight from "@material-symbols/svg-600/rounded/chevron_right.svg";
import Close from "@material-symbols/svg-600/rounded/close.svg";
import ConfirmationNumber from "@material-symbols/svg-600/rounded/confirmation_number.svg";
import ContentCopy from "@material-symbols/svg-600/rounded/content_copy.svg";
import CreditCard from "@material-symbols/svg-600/rounded/credit_card.svg";
import Delete from "@material-symbols/svg-600/rounded/delete.svg";
import DirectionsCar from "@material-symbols/svg-600/rounded/directions_car.svg";
import ErrorIcon from "@material-symbols/svg-600/rounded/error.svg";
import ErrorFill from "@material-symbols/svg-600/rounded/error-fill.svg";
import HandshakeFill from "@material-symbols/svg-600/rounded/handshake-fill.svg";
import Home from "@material-symbols/svg-600/rounded/home.svg";
import Info from "@material-symbols/svg-600/rounded/info.svg";
import KeyboardArrowDown from "@material-symbols/svg-600/rounded/keyboard_arrow_down.svg";
import LocalFireDepartmentFill from "@material-symbols/svg-600/rounded/local_fire_department-fill.svg";
import LocationOn from "@material-symbols/svg-600/rounded/location_on.svg";
import MyLocation from "@material-symbols/svg-600/rounded/my_location.svg";
import Package2 from "@material-symbols/svg-600/rounded/package_2.svg";
import Park from "@material-symbols/svg-600/rounded/park.svg";
import Payments from "@material-symbols/svg-600/rounded/payments.svg";
import Person from "@material-symbols/svg-600/rounded/person.svg";
import ListAlt from "@material-symbols/svg-600/rounded/list_alt.svg";
import Refresh from "@material-symbols/svg-600/rounded/refresh.svg";
import Remove from "@material-symbols/svg-600/rounded/remove.svg";
import Restaurant from "@material-symbols/svg-600/rounded/restaurant.svg";
import Schedule from "@material-symbols/svg-600/rounded/schedule.svg";
import Search from "@material-symbols/svg-600/rounded/search.svg";
import LocalActivity from "@material-symbols/svg-600/rounded/local_activity.svg";
import LocalActivityFill from "@material-symbols/svg-600/rounded/local_activity-fill.svg";
import ShoppingCart from "@material-symbols/svg-600/rounded/shopping_cart.svg";
import SkipNext from "@material-symbols/svg-600/rounded/skip_next.svg";
import StarFill from "@material-symbols/svg-600/rounded/star-fill.svg";
import SwapVert from "@material-symbols/svg-600/rounded/swap_vert.svg";
import Wallet from "@material-symbols/svg-600/rounded/wallet.svg";
import Work from "@material-symbols/svg-600/rounded/work.svg";

type Glyph = (props: SVGProps<SVGSVGElement>) => ReactElement;

/**
 * Material Symbols Rounded, peso 600, grau 0, tamanho óptico 24. Traço grosso e
 * canto arredondado, como no app. Uma família só em todo o projeto, sem ícone desenhado à mão.
 * "coupon" usa `local_activity` e "receipt" usa `list_alt`: a etiqueta e o
 * cupom fiscal do Material têm bicos e serrilhado. Selo, nota, chama e
 * erro usam a variante preenchida; o cabeçalho e a navegação seguem vazados.
 */
const icons = {
  alert: ErrorIcon,
  alertFill: ErrorFill,
  arrowLeft: ArrowBack,
  arrowRight: ArrowForward,
  boltFill: BoltFill,
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
  coupon: LocalActivity,
  couponFill: LocalActivityFill,
  flameFill: LocalFireDepartmentFill,
  handshakeFill: HandshakeFill,
  home: Home,
  info: Info,
  minus: Remove,
  pin: LocationOn,
  plus: Add,
  receipt: ListAlt,
  refresh: Refresh,
  search: Search,
  skipForward: SkipNext,
  starFill: StarFill,
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
