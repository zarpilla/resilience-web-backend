import type { Struct, Schema } from '@strapi/strapi';

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
    backgroundImage: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    title: Schema.Attribute.String;
    titleHeading: Schema.Attribute.Enumeration<['h1', 'h2', 'h3', 'h4', 'p']>;
    styles: Schema.Attribute.Component<'meta.styles', false>;
  };
}

export interface SectionsBlurbs extends Struct.ComponentSchema {
  collectionName: 'components_sections_blurbs';
  info: {
    displayName: 'Blurbs';
    description: '';
  };
  attributes: {
    title: Schema.Attribute.String;
    titleHeading: Schema.Attribute.Enumeration<['h1', 'h2', 'h3', 'h4', 'p']>;
    text: Schema.Attribute.Blocks;
    media: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    styles: Schema.Attribute.Component<'meta.styles', true>;
    link: Schema.Attribute.Component<'meta.link', false>;
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
    marginTop: Schema.Attribute.Integer;
    marginRight: Schema.Attribute.Integer;
    marginBottom: Schema.Attribute.Integer;
    marginLeft: Schema.Attribute.Integer;
    paddingTop: Schema.Attribute.Integer;
    paddingRight: Schema.Attribute.Integer;
    paddingBottom: Schema.Attribute.Integer;
    paddingLeft: Schema.Attribute.Integer;
    units: Schema.Attribute.Enumeration<['rem', 'px']>;
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
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'sections.image': SectionsImage;
      'sections.hero': SectionsHero;
      'sections.blurbs': SectionsBlurbs;
      'meta.styles': MetaStyles;
      'meta.social': MetaSocial;
      'meta.metadata': MetaMetadata;
      'meta.link': MetaLink;
      'meta.children2': MetaChildren2;
      'meta.children': MetaChildren;
    }
  }
}
