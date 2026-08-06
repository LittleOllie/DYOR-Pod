export type ContactEnquiry = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  createdAt: string;
};

export type NewsletterSignup = {
  id: string;
  email: string;
  interests: string[];
  createdAt: string;
};
