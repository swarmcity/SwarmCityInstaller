FROM node:8
WORKDIR /root
RUN apt-get update && \
    apt-get install git
ENV HOME /root

EXPOSE 8080
EXPOSE 8011
VOLUME /root
ENTRYPOINT ["node" ]
CMD [ "server.js"]

