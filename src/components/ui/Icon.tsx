import type { ReactElement, SVGProps } from "react";

// Material Icons (família antiga, estilo redondo): carro, carrinho, prancheta e
// moto com caixa. Os Symbols deixam esses quatro desenhos angulosos demais.
import CarRound from "@material-design-icons/svg/outlined/directions_car.svg";
import CartRound from "@material-design-icons/svg/outlined/shopping_cart.svg";
import AssignmentRound from "@material-design-icons/svg/outlined/assignment.svg";
import Moped from "@material-symbols/svg-400/rounded/moped.svg";

import Add from "@material-symbols/svg-600/rounded/add.svg";
import ArrowBack from "@material-symbols/svg-600/rounded/arrow_back.svg";
import ArrowForward from "@material-symbols/svg-600/rounded/arrow_forward.svg";
import ArrowOutward from "@material-symbols/svg-600/rounded/arrow_outward.svg";
import BoltFill from "@material-symbols/svg-600/rounded/bolt-fill.svg";
import Check from "@material-symbols/svg-600/rounded/check.svg";
import ChevronLeft from "@material-symbols/svg-600/rounded/chevron_left.svg";
import ChevronRight from "@material-symbols/svg-600/rounded/chevron_right.svg";
import Close from "@material-symbols/svg-600/rounded/close.svg";
import ConfirmationNumber from "@material-symbols/svg-600/rounded/confirmation_number.svg";
import ContentCopy from "@material-symbols/svg-600/rounded/content_copy.svg";
import CreditCard from "@material-symbols/svg-600/rounded/credit_card.svg";
import Delete from "@material-symbols/svg-600/rounded/delete.svg";

import ErrorIcon from "@material-symbols/svg-600/rounded/error.svg";
import ErrorFill from "@material-symbols/svg-600/rounded/error-fill.svg";
import HandshakeFill from "@material-symbols/svg-600/rounded/handshake-fill.svg";
import Home from "@material-symbols/svg-600/rounded/home.svg";
import Info from "@material-symbols/svg-600/rounded/info.svg";
import KeyboardArrowDown from "@material-symbols/svg-600/rounded/keyboard_arrow_down.svg";
import LocalFireDepartmentFill from "@material-symbols/svg-600/rounded/local_fire_department-fill.svg";
import LocationOn from "@material-symbols/svg-600/rounded/location_on.svg";
import MyLocation from "@material-symbols/svg-600/rounded/my_location.svg";
import DeployedCode from "@material-symbols/svg-600/rounded/deployed_code.svg";
import Package2 from "@material-symbols/svg-600/rounded/package_2.svg";
import AttachMoney from "@material-symbols/svg-600/rounded/attach_money.svg";
import Park from "@material-symbols/svg-600/rounded/park.svg";
import Payments from "@material-symbols/svg-600/rounded/payments.svg";
import Person from "@material-symbols/svg-600/rounded/person.svg";
import PhotoCamera from "@material-symbols/svg-600/rounded/photo_camera.svg";

import Refresh from "@material-symbols/svg-600/rounded/refresh.svg";
import Remove from "@material-symbols/svg-600/rounded/remove.svg";
import Restaurant from "@material-symbols/svg-600/rounded/restaurant.svg";
import Schedule from "@material-symbols/svg-600/rounded/schedule.svg";
import Search from "@material-symbols/svg-600/rounded/search.svg";
import PercentDiscount from "@material-symbols/svg-600/rounded/percent_discount.svg";
import PercentDiscountFill from "@material-symbols/svg-600/rounded/percent_discount-fill.svg";



import SkipNext from "@material-symbols/svg-600/rounded/skip_next.svg";
import StarFill from "@material-symbols/svg-600/rounded/star-fill.svg";
import SwapVert from "@material-symbols/svg-600/rounded/swap_vert.svg";
import Wallet from "@material-symbols/svg-600/rounded/wallet.svg";
import Work from "@material-symbols/svg-600/rounded/work.svg";

type Glyph = (props: SVGProps<SVGSVGElement>) => ReactElement;

/**
 * Material Symbols Rounded, peso 600, grau 0, tamanho óptico 24. Traço grosso e
 * canto arredondado, como no app. Uma família só em todo o projeto, sem ícone desenhado à mão.
 * Carro, carrinho, prancheta e moto com caixa vêm da família antiga, mais
 * redonda. O cupom usa `percent_discount`, o selo com % do app. Selo, nota,
 * chama e erro usam a variante preenchida; a navegação segue vazada.
 */
const icons = {
  alert: ErrorIcon,
  alertFill: ErrorFill,
  arrowLeft: ArrowBack,
  arrowRight: ArrowForward,
  arrowDiagonal: ArrowOutward,
  boltFill: BoltFill,
  box: DeployedCode,
  boxLine: Package2,
  money: AttachMoney,
  briefcase: Work,
  car: CarRound,
  card: CreditCard,
  cart: CartRound,
  cash: Payments,
  check: Check,
  chevronDown: KeyboardArrowDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  clock: Schedule,
  copy: ContentCopy,
  coupon: PercentDiscount,
  couponFill: PercentDiscountFill,
  flameFill: LocalFireDepartmentFill,
  handshakeFill: HandshakeFill,
  home: Home,
  info: Info,
  minus: Remove,
  moto: Moped,
  camera: PhotoCamera,
  pin: LocationOn,
  plus: Add,
  receipt: AssignmentRound,
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
