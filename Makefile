.PHONY: dev dev-once test install

dev:
	@trap 'kill 0' EXIT; \
	npm --workspace apps/api run dev & \
	npm --workspace apps/web run dev

dev-once:
	npm --workspace apps/web run build
	@trap 'kill 0' EXIT; \
	npm exec --workspace apps/api -- tsx --env-file=.env src/index.ts & \
	npm --workspace apps/web run preview

test:
	npm run test

install:
	npm install
