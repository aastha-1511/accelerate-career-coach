/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        remotePatterns:[
            {
                protocol:"https",
                hostname: "randomuser.me/api/portraits",
            },
        ],
    },
    // experimental: {
    //     optimizeCss: false
    // },
};

export default nextConfig;
