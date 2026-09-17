import { useEffect } from "react";
import { useThunderID } from "@thunderid/react";
import { setAccessTokenGetter } from "./accessToken";
import { type ThunderIDHookState } from "./thunderid";

export default function AuthBridge(): null {
	const auth = useThunderID() as ThunderIDHookState;

	useEffect(() => {
		setAccessTokenGetter(async () => {
			if (!auth.isSignedIn) {
				return null;
			}

			return auth.getAccessToken();
		});

		return () => {
			setAccessTokenGetter(null);
		};
	}, [auth]);

	return null;
}