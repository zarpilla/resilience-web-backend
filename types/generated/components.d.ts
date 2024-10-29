import type { Struct, Schema } from '@strapi/strapi';

export interface SectionsSlider extends Struct.ComponentSchema {
  collectionName: 'components_sections_sliders';
  info: {
    displayName: 'Slider';
    description: '';
  };
  attributes: {
    subTitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
    menu: Schema.Attribute.Relation<'oneToOne', 'api::menu.menu'>;
    c2a: Schema.Attribute.Component<'meta.c2-a', false>;
    styles: Schema.Attribute.Component<'meta.styles', false>;
    goToText: Schema.Attribute.String;
    background: Schema.Attribute.String;
  };
}

export interface SectionsScroller extends Struct.ComponentSchema {
  collectionName: 'components_sections_scrollers';
  info: {
    displayName: 'Scroller';
    description: '';
  };
  attributes: {
    title: Schema.Attribute.String;
    subtitle: Schema.Attribute.Text;
    menu: Schema.Attribute.Relation<'oneToOne', 'api::menu.menu'>;
    styles: Schema.Attribute.Component<'meta.styles', false>;
  };
}

export interface SectionsMenu extends Struct.ComponentSchema {
  collectionName: 'components_sections_menus';
  info: {
    displayName: 'Menu';
    description: '';
  };
  attributes: {
    menu: Schema.Attribute.Relation<'oneToOne', 'api::menu.menu'>;
    styles: Schema.Attribute.Component<'meta.styles', false>;
    preset: Schema.Attribute.Enumeration<['default', 'tags-cloud', 'marquee']> &
      Schema.Attribute.DefaultTo<'default'>;
  };
}

export interface SectionsImage extends Struct.ComponentSchema {
  collectionName: 'components_sections_images';
  info: {
    displayName: 'image';
    description: '';
  };
  attributes: {
    image: Schema.Attribute.Media<'images' | 'files'>;
    hover: Schema.Attribute.Media<'images' | 'files'>;
    styles: Schema.Attribute.Component<'meta.styles', false>;
  };
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heroes';
  info: {
    displayName: 'Hero';
    description: '';
  };
  attributes: {
    title: Schema.Attribute.String;
    titleHeading: Schema.Attribute.Enumeration<['h1', 'h2', 'h3', 'h4', 'p']>;
    styles: Schema.Attribute.Component<'meta.styles', false>;
    text: Schema.Attribute.Blocks;
    align: Schema.Attribute.Enumeration<['bottom-left', 'centered']> &
      Schema.Attribute.DefaultTo<'bottom-left'>;
  };
}

export interface SectionsColumns extends Struct.ComponentSchema {
  collectionName: 'components_sections_columns';
  info: {
    displayName: 'Columns';
    description: '';
  };
  attributes: {
    columns: Schema.Attribute.Component<'meta.column', true>;
    styles: Schema.Attribute.Component<'meta.styles', false>;
  };
}

export interface SectionsBlurbs extends Struct.ComponentSchema {
  collectionName: 'components_sections_blurbs';
  info: {
    displayName: 'Blurbs';
  };
  attributes: {
    title: Schema.Attribute.String;
    blurbs: Schema.Attribute.Component<'meta.blurb', true>;
    styles: Schema.Attribute.Component<'meta.styles', false>;
  };
}

export interface SectionsBios extends Struct.ComponentSchema {
  collectionName: 'components_sections_bios';
  info: {
    displayName: 'Bios';
    icon: 'alien';
    description: '';
  };
  attributes: {
    bios: Schema.Attribute.Relation<'oneToMany', 'api::bio.bio'>;
    title: Schema.Attribute.String;
    titleHeading: Schema.Attribute.Enumeration<
      ['h1', 'h2', 'h3', 'h4', 'h5', 'p']
    >;
    preset: Schema.Attribute.Enumeration<['grid', 'list']> &
      Schema.Attribute.DefaultTo<'grid'>;
    subtitle: Schema.Attribute.String;
    c2aText: Schema.Attribute.String;
    styles: Schema.Attribute.Component<'meta.styles', false>;
  };
}

export interface MetaStyles extends Struct.ComponentSchema {
  collectionName: 'components_meta_styles';
  info: {
    displayName: 'styles';
    description: '';
  };
  attributes: {
    cssClass: Schema.Attribute.String;
    backgroundImage: Schema.Attribute.Media<'images' | 'files'>;
    height: Schema.Attribute.String;
    textColor: Schema.Attribute.Enumeration<['light', 'dark']> &
      Schema.Attribute.DefaultTo<'dark'>;
    margin: Schema.Attribute.String;
    padding: Schema.Attribute.String;
    background: Schema.Attribute.String;
    width: Schema.Attribute.String;
    container: Schema.Attribute.Enumeration<['normal', 'narrow', 'small']>;
    sectionId: Schema.Attribute.String;
    backgroundColor: Schema.Attribute.String;
  };
}

export interface MetaSocial extends Struct.ComponentSchema {
  collectionName: 'components_meta_socials';
  info: {
    displayName: 'social';
  };
  attributes: {
    href: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images' | 'files'>;
    hover: Schema.Attribute.Media<'images' | 'files'>;
  };
}

export interface MetaMetadata extends Struct.ComponentSchema {
  collectionName: 'components_meta_metadata';
  info: {
    displayName: 'metadata';
  };
  attributes: {
    metaTitle: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text;
    shareImage: Schema.Attribute.Media<'images' | 'files'>;
    noIndex: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
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

export interface MetaColumn extends Struct.ComponentSchema {
  collectionName: 'components_meta_columns';
  info: {
    displayName: 'Column';
    description: '';
  };
  attributes: {
    text: Schema.Attribute.Blocks;
    media: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    styles: Schema.Attribute.Component<'meta.styles', false>;
    c2a: Schema.Attribute.Component<'meta.c2-a', false>;
    title: Schema.Attribute.String;
    titleHeading: Schema.Attribute.Enumeration<
      ['h1', 'h2', 'h3', 'h4', 'h5', 'p']
    >;
  };
}

export interface MetaColumnContent extends Struct.ComponentSchema {
  collectionName: 'components_meta_column_contents';
  info: {
    displayName: 'ColumnContent';
  };
  attributes: {
    text: Schema.Attribute.Blocks;
    media: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    mediaHover: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
  };
}

export interface MetaChildren2 extends Struct.ComponentSchema {
  collectionName: 'components_meta_children2s';
  info: {
    displayName: 'children2';
  };
  attributes: {
    title: Schema.Attribute.String;
    page: Schema.Attribute.Relation<'oneToOne', 'api::page.page'>;
    href: Schema.Attribute.String;
  };
}

export interface MetaChildren extends Struct.ComponentSchema {
  collectionName: 'components_meta_children';
  info: {
    displayName: 'children';
    description: '';
  };
  attributes: {
    title: Schema.Attribute.String;
    page: Schema.Attribute.Relation<'oneToOne', 'api::page.page'>;
    href: Schema.Attribute.String;
    children: Schema.Attribute.Component<'meta.children2', true>;
    submenu: Schema.Attribute.Relation<'oneToOne', 'api::menu.menu'>;
  };
}

export interface MetaC2A extends Struct.ComponentSchema {
  collectionName: 'components_meta_c2_as';
  info: {
    displayName: 'C2A';
    description: '';
  };
  attributes: {
    text: Schema.Attribute.String;
    href: Schema.Attribute.String;
    target: Schema.Attribute.Enumeration<['_self', '_blank']>;
    page: Schema.Attribute.Relation<'oneToOne', 'api::page.page'>;
    cssClass: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'btn mt-4 btn-with-arrow-right zbtn-dark zw-100'>;
  };
}

export interface MetaBlurb extends Struct.ComponentSchema {
  collectionName: 'components_meta_blurbs';
  info: {
    displayName: 'Blurb';
  };
  attributes: {
    title: Schema.Attribute.String;
    titleHeading: Schema.Attribute.Enumeration<
      ['h1', 'h2', 'h3', 'h4', 'h5', 'p']
    >;
    text: Schema.Attribute.Blocks;
    image: Schema.Attribute.Media<'images' | 'files'>;
    imagePosition: Schema.Attribute.Enumeration<['top', 'left']> &
      Schema.Attribute.DefaultTo<'top'>;
    imageWidth: Schema.Attribute.String;
    cssClass: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'sections.slider': SectionsSlider;
      'sections.scroller': SectionsScroller;
      'sections.menu': SectionsMenu;
      'sections.image': SectionsImage;
      'sections.hero': SectionsHero;
      'sections.columns': SectionsColumns;
      'sections.blurbs': SectionsBlurbs;
      'sections.bios': SectionsBios;
      'meta.styles': MetaStyles;
      'meta.social': MetaSocial;
      'meta.metadata': MetaMetadata;
      'meta.link': MetaLink;
      'meta.column': MetaColumn;
      'meta.column-content': MetaColumnContent;
      'meta.children2': MetaChildren2;
      'meta.children': MetaChildren;
      'meta.c2-a': MetaC2A;
      'meta.blurb': MetaBlurb;
    }
  }
}
