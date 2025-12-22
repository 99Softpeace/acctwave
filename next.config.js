/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ensure webhooks work with or without trailing slash
    skipTrailingSlashRedirect: true,

    // Optional: Disable strict mode for production stability
    reactStrictMode: true,
};

module.exports = nextConfig;
