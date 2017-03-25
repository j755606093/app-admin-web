FROM nginx:1.11.5

COPY . /var/admin-web


EXPOSE 8088


CMD ["nginx", "-g", "daemon off;"]