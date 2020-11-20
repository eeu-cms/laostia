const { AbilityBuilder, Ability } = require('@casl/ability');
const { toMongoQuery } = require('@casl/mongoose');
const { Forbidden, GeneralError } = require('@feathersjs/errors');

const TYPE_KEY = Symbol.for('type');

function subjectName(subject) {
	if (!subject || typeof subject === 'string') {
		return subject;
	}

	return subject[TYPE_KEY];
}

function errorMessage(action, serviceName) {
	return `No tienes permisos para ${action} en el servicio ${serviceName}`;
}

async function defineAbilitiesFor(ctx, options) {
	const { rules, can } = new AbilityBuilder();
	const {
		params: { user },
	} = ctx;

	const role = user ? user.roles : null;

	if (role === 'admin') {
		// noinspection JSCheckFunctionSignatures
		can('manage', 'all');
		return new Ability(rules, { subjectName });
	}

	async function grantAccess(accessList, withAuthentication = false) {
		for (let i = 0; i < accessList.length; i++) {
			const access = accessList[i];

			if (access.method && !Array.isArray(access.method))
				access.method = [access.method];

			if (!access.method || !access.method.length || !access.service) {
				throw new GeneralError('Error Abilities', {
					index: i,
					message: 'Servicio o metodo invalido',
				});
			}

			if (
				options.serviceName === access.service &&
				access.method.includes(options.action)
			) {
				const can_params = [access.method, access.service];

				const query = access.query
					? typeof access.query === 'function'
						? await access.query(access)
						: access.query
					: null;

				if (
					['get', 'find', 'update', 'patch', 'remove'].includes(options.action)
				) {
					if (query) {
						can_params.push(query);
					} else if (withAuthentication) {
						const key = access.key || 'user_id';
						// noinspection JSUnresolvedVariable
						const key_model = access.key_model || '_id';

						can_params.push({ [key]: user[key_model] });
					}
				}

				// noinspection JSCheckFunctionSignatures
				can(...can_params);
			}
		}
	}

	const Q = (() => {
		async function isOwner() {
			return { client_id: user._id };
		}

		async function isSelf() {
			return { _id: user._id };
		}

		return {
			isOwner,
			isSelf,
		};
	})();

	// permisos de usuarios sin session
	const freeAccessServices = [
		{ method: ['create'], service: 'users' },
		{ method: ['get', 'find'], service: 'products' },
		{ method: ['get', 'find'], service: 'products-categories' },
	];

	// permisos generales
	//
	// se otorgan a cualquier usuario, aun si no tienen compañia asociada
	const userAccessServices = [
		{ method: ['get', 'find'], service: 'users', query: Q.isSelf },
		{
			method: ['get', 'find', 'update', 'patch'],
			service: 'orders',
			query: Q.isOwner,
		},
		{ method: ['create'], service: 'orders' },
	];

	/** otorgamos permisos */

	await grantAccess(freeAccessServices);

	if (user) {
		await grantAccess(userAccessServices);
	}

	return new Ability(rules, { subjectName });
}

function canReadQuery(query) {
	return query !== null;
}

module.exports = function authorize(name = null) {
	return async function (hook) {
		const action = hook.method;
		const service = name ? hook.app.service(name) : hook.service;
		const serviceName = name || hook.path;
		const ability = await defineAbilitiesFor(hook, { serviceName, action });
		const throwUnlessCan = (action, resource) => {
			if (ability.cannot(action, resource)) {
				throw new Forbidden(errorMessage(action, serviceName));
			}
		};

		hook.params.ability = ability;

		if (hook.method === 'create') {
			hook.data[TYPE_KEY] = serviceName;
			throwUnlessCan('create', hook.data);
		}

		if (!hook.id) {
			const query = toMongoQuery(ability, serviceName, action);

			if (canReadQuery(query)) {
				Object.assign(hook.params.query, query);
			} else {
				hook.params.query.id = 0;
			}

			return hook;
		}

		const params = Object.assign({}, hook.params, { provider: null });
		const result = await service.get(hook.id, params);

		result[TYPE_KEY] = serviceName;
		throwUnlessCan(action, result);

		if (action === 'get') {
			hook.result = result;
		}

		return hook;
	};
};
