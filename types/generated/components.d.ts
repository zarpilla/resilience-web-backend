import type { Schema, Struct } from '@strapi/strapi';

export interface MetaBlogPage extends Struct.ComponentSchema {
  collectionName: 'components_meta_blog_pages';
  info: {
    displayName: 'BlogPage';
  };
  attributes: {
    page: Schema.Attribute.Relation<'oneToOne', 'api::page.page'>;
    width: Schema.Attribute.Enumeration<
      ['onethird', 'twothirds', 'threethirds']
    >;
  };
}

export interface MetaBlurb extends Struct.ComponentSchema {
  collectionName: 'components_meta_blurbs';
  info: {
    description: '';
    displayName: 'Blurb';
  };
  attributes: {
    cssClass: Schema.Attribute.String;
    effect: Schema.Attribute.Enumeration<['dots', 'grow']> &
      Schema.Attribute.DefaultTo<'dots'>;
    image: Schema.Attribute.Media<'images' | 'files'>;
    imagePosition: Schema.Attribute.Enumeration<['top', 'left']> &
      Schema.Attribute.DefaultTo<'top'>;
    imageWidth: Schema.Attribute.String;
    svg: Schema.Attribute.Text;
    text: Schema.Attribute.Blocks;
    title: Schema.Attribute.String;
    titleHeading: Schema.Attribute.Enumeration<
      ['h1', 'h2', 'h3', 'h4', 'h5', 'p']
    >;
  };
}

export interface MetaC2A extends Struct.ComponentSchema {
  collectionName: 'components_meta_c2_as';
  info: {
    description: '';
    displayName: 'C2A';
  };
  attributes: {
    cssClass: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'btn mt-4 btn-with-arrow-right zbtn-dark zw-100'>;
    href: Schema.Attribute.String;
    page: Schema.Attribute.Relation<'oneToOne', 'api::page.page'>;
    target: Schema.Attribute.Enumeration<['_self', '_blank']>;
    text: Schema.Attribute.String;
  };
}

export interface MetaChildren extends Struct.ComponentSchema {
  collectionName: 'components_meta_children';
  info: {
    description: '';
    displayName: 'children';
  };
  attributes: {
    children: Schema.Attribute.Component<'meta.children2', true>;
    href: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images' | 'files'>;
    page: Schema.Attribute.Relation<'oneToOne', 'api::page.page'>;
    submenu: Schema.Attribute.Relation<'oneToOne', 'api::menu.menu'>;
    title: Schema.Attribute.String;
  };
}

export interface MetaChildren2 extends Struct.ComponentSchema {
  collectionName: 'components_meta_children2s';
  info: {
    displayName: 'children2';
  };
  attributes: {
    href: Schema.Attribute.String;
    page: Schema.Attribute.Relation<'oneToOne', 'api::page.page'>;
    title: Schema.Attribute.String;
  };
}

export interface MetaColumn extends Struct.ComponentSchema {
  collectionName: 'components_meta_columns';
  info: {
    description: '';
    displayName: 'Column';
  };
  attributes: {
    alias: Schema.Attribute.String;
    c2a: Schema.Attribute.Component<'meta.c2-a', false>;
    media: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    styles: Schema.Attribute.Component<'meta.styles', false>;
    text: Schema.Attribute.Blocks;
    title: Schema.Attribute.String;
    titleHeading: Schema.Attribute.Enumeration<
      ['h1', 'h2', 'h3', 'h4', 'h5', 'p']
    >;
    verticalScroller: Schema.Attribute.Relation<'oneToOne', 'api::menu.menu'>;
  };
}

export interface MetaColumnContent extends Struct.ComponentSchema {
  collectionName: 'components_meta_column_contents';
  info: {
    displayName: 'ColumnContent';
  };
  attributes: {
    media: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    mediaHover: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    text: Schema.Attribute.Blocks;
  };
}

export interface MetaLink extends Struct.ComponentSchema {
  collectionName: 'components_meta_links';
  info: {
    displayName: 'link';
  };
  attributes: {
    href: Schema.Attribute.String;
    page: Schema.Attribute.Relation<'oneToOne', 'api::page.page'>;
    target: Schema.Attribute.Enumeration<['_self', '_blank']>;
  };
}

export interface MetaMetadata extends Struct.ComponentSchema {
  collectionName: 'components_meta_metadata';
  info: {
    displayName: 'metadata';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text;
    metaTitle: Schema.Attribute.String;
    noIndex: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    shareImage: Schema.Attribute.Media<'images' | 'files'>;
  };
}

export interface MetaSocial extends Struct.ComponentSchema {
  collectionName: 'components_meta_socials';
  info: {
    displayName: 'social';
  };
  attributes: {
    hover: Schema.Attribute.Media<'images' | 'files'>;
    href: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images' | 'files'>;
  };
}

export interface MetaStyles extends Struct.ComponentSchema {
  collectionName: 'components_meta_styles';
  info: {
    description: '';
    displayName: 'styles';
  };
  attributes: {
    background: Schema.Attribute.String;
    backgroundColor: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files'>;
    backgroundImage2: Schema.Attribute.Media<'images' | 'files'>;
    container: Schema.Attribute.Enumeration<
      ['normal', 'narrow', 'article', 'small', 'xxl']
    >;
    cssClass: Schema.Attribute.String;
    height: Schema.Attribute.String;
    margin: Schema.Attribute.String;
    padding: Schema.Attribute.String;
    sectionId: Schema.Attribute.String;
    textColor: Schema.Attribute.Enumeration<['light', 'dark']> &
      Schema.Attribute.DefaultTo<'dark'>;
    width: Schema.Attribute.String;
  };
}

export interface MetaSubscriptionForm extends Struct.ComponentSchema {
  collectionName: 'components_meta_subscription_forms';
  info: {
    description: '';
    displayName: 'SubscriptionForm';
  };
  attributes: {
    accept: Schema.Attribute.String;
    button: Schema.Attribute.String;
    email: Schema.Attribute.String;
    messageKo: Schema.Attribute.Text;
    messageOk: Schema.Attribute.Text;
    sendEmailTo: Schema.Attribute.String;
  };
}

export interface SectionsBios extends Struct.ComponentSchema {
  collectionName: 'components_sections_bios';
  info: {
    description: '';
    displayName: 'Bios';
    icon: 'alien';
  };
  attributes: {
    bios: Schema.Attribute.Relation<'oneToMany', 'api::bio.bio'>;
    c2aText: Schema.Attribute.String;
    preset: Schema.Attribute.Enumeration<['grid', 'list']> &
      Schema.Attribute.DefaultTo<'grid'>;
    styles: Schema.Attribute.Component<'meta.styles', false>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
    titleHeading: Schema.Attribute.Enumeration<
      ['h1', 'h2', 'h3', 'h4', 'h5', 'p']
    >;
  };
}

export interface SectionsBlog extends Struct.ComponentSchema {
  collectionName: 'components_sections_blogs';
  info: {
    description: '';
    displayName: 'Blog';
  };
  attributes: {
    blogPage: Schema.Attribute.Component<'meta.blog-page', true>;
    styles: Schema.Attribute.Component<'meta.styles', false>;
  };
}

export interface SectionsBlurbs extends Struct.ComponentSchema {
  collectionName: 'components_sections_blurbs';
  info: {
    description: '';
    displayName: 'Blurbs';
  };
  attributes: {
    blurbs: Schema.Attribute.Component<'meta.blurb', true>;
    styles: Schema.Attribute.Component<'meta.styles', false>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsCapabilities extends Struct.ComponentSchema {
  collectionName: 'components_sections_capabilities';
  info: {
    displayName: 'Capabilities';
  };
  attributes: {
    capabilities: Schema.Attribute.Relation<
      'oneToMany',
      'api::capability.capability'
    >;
    styles: Schema.Attribute.Component<'meta.styles', false>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SectionsColumns extends Struct.ComponentSchema {
  collectionName: 'components_sections_columns';
  info: {
    description: '';
    displayName: 'Columns';
  };
  attributes: {
    alias: Schema.Attribute.String;
    columns: Schema.Attribute.Component<'meta.column', true>;
    styles: Schema.Attribute.Component<'meta.styles', false>;
  };
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heroes';
  info: {
    description: '';
    displayName: 'Hero';
  };
  attributes: {
    alias: Schema.Attribute.String;
    align: Schema.Attribute.Enumeration<['bottom-left', 'centered']> &
      Schema.Attribute.DefaultTo<'bottom-left'>;
    styles: Schema.Attribute.Component<'meta.styles', false>;
    text: Schema.Attribute.Blocks;
    title: Schema.Attribute.String;
    titleHeading: Schema.Attribute.Enumeration<['h1', 'h2', 'h3', 'h4', 'p']>;
  };
}

export interface SectionsMenu extends Struct.ComponentSchema {
  collectionName: 'components_sections_menus';
  info: {
    description: '';
    displayName: 'Menu';
  };
  attributes: {
    alias: Schema.Attribute.String;
    menu: Schema.Attribute.Relation<'oneToOne', 'api::menu.menu'>;
    preset: Schema.Attribute.Enumeration<['default', 'tags-cloud', 'marquee']> &
      Schema.Attribute.DefaultTo<'default'>;
    styles: Schema.Attribute.Component<'meta.styles', false>;
  };
}

export interface SectionsScroller extends Struct.ComponentSchema {
  collectionName: 'components_sections_scrollers';
  info: {
    description: '';
    displayName: 'Scroller';
  };
  attributes: {
    alias: Schema.Attribute.String;
    menu: Schema.Attribute.Relation<'oneToOne', 'api::menu.menu'>;
    preset: Schema.Attribute.Enumeration<['pages', 'images']> &
      Schema.Attribute.DefaultTo<'pages'>;
    styles: Schema.Attribute.Component<'meta.styles', false>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SectionsSlider extends Struct.ComponentSchema {
  collectionName: 'components_sections_sliders';
  info: {
    description: '';
    displayName: 'Slider';
  };
  attributes: {
    background: Schema.Attribute.String;
    c2a: Schema.Attribute.Component<'meta.c2-a', false>;
    goToText: Schema.Attribute.String;
    intervalMilliseconds: Schema.Attribute.Integer &
      Schema.Attribute.DefaultTo<8000>;
    menu: Schema.Attribute.Relation<'oneToOne', 'api::menu.menu'>;
    preset: Schema.Attribute.Enumeration<['one', 'three']>;
    styles: Schema.Attribute.Component<'meta.styles', false>;
    subTitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'meta.blog-page': MetaBlogPage;
      'meta.blurb': MetaBlurb;
      'meta.c2-a': MetaC2A;
      'meta.children': MetaChildren;
      'meta.children2': MetaChildren2;
      'meta.column': MetaColumn;
      'meta.column-content': MetaColumnContent;
      'meta.link': MetaLink;
      'meta.metadata': MetaMetadata;
      'meta.social': MetaSocial;
      'meta.styles': MetaStyles;
      'meta.subscription-form': MetaSubscriptionForm;
      'sections.bios': SectionsBios;
      'sections.blog': SectionsBlog;
      'sections.blurbs': SectionsBlurbs;
      'sections.capabilities': SectionsCapabilities;
      'sections.columns': SectionsColumns;
      'sections.hero': SectionsHero;
      'sections.menu': SectionsMenu;
      'sections.scroller': SectionsScroller;
      'sections.slider': SectionsSlider;
    }
  }
}
