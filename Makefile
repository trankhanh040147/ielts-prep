.PHONY: dev test install

dev:
	@trap 'kill 0' EXIT; \
	npm --workspace apps/api run dev & \
	npm --workspace apps/web run dev

test:
	npm run test

install:
	npm install
