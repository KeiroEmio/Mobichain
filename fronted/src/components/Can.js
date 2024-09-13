import useAuth from "hooks/useAuth";

export function CanView(props) {
	const auth = useAuth();
	if (auth.canView(props.pagePath)) {
		return props.children;
	}
}

export function CanManage(props) {
	const auth = useAuth();
	if (auth.canManage(props.pagePath)) {
		return props.children;
	}
}

export function IsOwner(props) {
	const auth = useAuth();
	if (auth.isOwner(props.recId)) {
		return props.children;
	}
}