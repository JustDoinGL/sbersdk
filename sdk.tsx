// Базовые интерфейсы для повторного использования
export interface ImageAsset {
  src: string
  alt?: string
}

export interface ResponsiveImage extends ImageAsset {
  srcset?: {
    '1x'?: string
    '2x'?: string
  }
}

export interface PictureSources {
  sources: {
    srcset: {
      '1x': string
      '2x': string
    }
    media: string
  }[]
  image: ResponsiveImage
}

export interface Link {
  text: string
  href: string
  target?: string
  rel?: string
  icon?: string
}

export interface NavItem {
  name: string
  label: string
  value: string
  id: string
}

// Стили
export interface StyleVariants {
  default: string
  person: string
  business: string
}

// Баннер
export interface MainBanner {
  id: string
  title: string
  subtitle: string
  description: string
  image: ImageAsset
  navLinks: NavItem[]
}

// Виджеты
export interface Card {
  title: string
  description?: string
  image: ImageAsset
}

export interface ListItem {
  image?: ImageAsset
  title?: string
  text?: string
  description?: string
  id?: string
  step?: string
}

export interface WidgetData {
  id: string
  title: string
  cards?: Card[]
  position?: string
  picture?: PictureSources
  items?: ListItem[]
  button?: Link
  description?: string
  background?: string
}

export interface Widget {
  tab: string
  component: string
  key: string
  data: WidgetData
}

// Форма
export interface FormField {
  name: string
  label: string
  col?: number
  id?: string
  placeholder?: string
  attributeId?: string
}

export interface FormService {
  url: string
  enableUUID: boolean
  enableCheckSpam: boolean
  useCrossSell: boolean
  fields: {
    attributeId: string
    id: string
  }[]
}

export interface FormState {
  title: string
  text: string
  image: ImageAsset
  button?: {
    text: string
  }
}

export interface FormConfiguration {
  type: string
  radioButtons: NavItem[]
  service: FormService
  fields: FormField[]
  button: {
    text: string
  }
  buttonPersonal: Link
  agreement: {
    text: string
  }
  states: {
    __comments: string
    success: FormState
    fail: FormState & {
      button: {
        text: string
      }
    }
    limit: FormState
  }
}

export interface FormSection {
  id: string
  title: string
  subtitle: string
  note: string
  form: FormConfiguration
}

// Дополнительная секция
export interface AdditionalSection {
  id: string
  title: string
  text: string[]
}

// Корневой интерфейс
export interface PageData {
  style: StyleVariants
  mainBanner: MainBanner
  widgets: Widget[]
  form: FormSection
  additional: AdditionalSection
}