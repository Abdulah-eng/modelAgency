export interface Model {
    id: string;
    name: string;
    slug: string;
    age: number;
    height: string;
    weight: string;
    measurements: string;
    eyes_color: string;
    hair_color: string;
    dress_size: string;
    bust: string;
    waist: string;
    hips: string;
    shoe_size: string;
    category: string;
    bio: string;
    cover_photo: string;
    is_featured: boolean;
    skills: { label: string; percent: number }[];
    contact_model_email: string;
    instagram_link?: string;
    telegram_link?: string;
    whatsapp_number?: string;
    created_at: string;
}

export interface Enquiry {
    id: string;
    model_id?: string;
    model_name?: string;
    full_name: string;
    email: string;
    phone?: string;
    message: string;
    enquiry_type: 'general' | 'model';
    created_at: string;
}

export interface ModelPhoto {
    id: string;
    model_id: string;
    url: string;
    caption: string;
    sort_order: number;
    created_at: string;
}

export interface SiteSettings {
    id: string;
    site_name: string;
    about_text: string;
    hero_image: string;
    hero_video_url: string;
    hero_video_text: string;
    hero_video_subtitle: string;
    telegram_link: string;
    phone_number: string;
    facebook_link: string;
    twitter_link: string;
    instagram_link: string;
    model_banner_image: string;
    // Contact section
    contact_email: string;
    contact_address: string;
    // Become our model section
    become_model_bg_url: string;
    become_model_text: string;
    // Casting section
    casting_image_url: string;
    casting_text: string;
    casting_manager_name: string;
    casting_manager_role: string;
    site_logo: string;
    site_favicon: string;
    updated_at: string;
}
