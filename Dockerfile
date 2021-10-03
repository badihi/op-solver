FROM node:14-alpine

ENV LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib/

ARG PACKAGES="git"
ARG BUILD_DEPS="build-base autoconf automake libtool m4 gmp-dev"

RUN apk update
RUN apk --no-cache --update add $PACKAGES
RUN apk --no-cache --update add $BUILD_DEPS

# Install op-solver
WORKDIR /src
RUN set -x \
  && git clone --depth 1  https://github.com/gkobeaga/op-solver \
  && ( \
    cd op-solver \
    && ./autogen.sh \
    && mkdir build && cd build \
    && ../configure \
    && make \
    && make check \
    && make install \
  )

WORKDIR /app
COPY node/package*.json ./
RUN npm install

COPY node/* ./

EXPOSE 80

CMD [ "node", "index.js" ]
