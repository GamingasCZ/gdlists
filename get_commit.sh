hash=`git rev-parse --short HEAD`
sed -i "s/VITE_LASTCOMMIT=.*/VITE_LASTCOMMIT=$hash/" .env.production
