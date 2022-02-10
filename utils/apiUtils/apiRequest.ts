import axios, { AxiosRequestConfig } from "axios";

type Options = {
	requestConfig?: AxiosRequestConfig;
	queryParams?: Record<string, string>;
};

export default class ApiRequest {
	static async get(url: string, options?: Options) {
		const defaultRequestConfig: AxiosRequestConfig = {
			headers: {
				Accept: "application/json",
				"User-Agent":
					"My Discord Bot (https://github.com/NabilHadi/RadCat-Bot)",
			},
		};

		// merge
		let requestConfig = {
			...defaultRequestConfig,
			...options?.requestConfig,
		};

		try {
			const queryParamsString = new URLSearchParams(
				options?.queryParams
			).toString();
			const res = await axios.get(`${url}?${queryParamsString}`, requestConfig);

			return res;
		} catch (error) {
			throw error;
		}
	}
}
