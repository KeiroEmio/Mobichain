
import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useLocalStore from 'hooks/useLocalStore';
import useApi from 'hooks/useApi';
import useUtils from 'hooks/useUtils';

const publicPages = ['/', 'index', 'error', ]; //public pages which do not need authentation

const roleAbilities = {
  "admin": [
    "user/edit",
    "user/delete"
  ],
  "user": []
};
const AuthContext = createContext();

export function AuthProvider({ children }) {
	const api = useApi();
	const utils = useUtils();
	const localStore = useLocalStore();
	const navigate = useNavigate();

	const accessToken = localStore.getToken();
	let loggedIn = false;
	if(accessToken){
		loggedIn = true;
	}

	const [user, setUser] = useState(null);
	const [userName, setUserName] = useState('');
	const [userId, setUserId] = useState('');
	const [userEmail, setUserEmail] = useState('');
	const [userPhoto, setUserPhoto] = useState('');
	const [userPhone, setUserPhone] = useState('');
	const [userRole, setUserRole] = useState('');
	const [userPages, setUserPages] = useState([]);

	const [isLoggedIn, setIsLoggedIn] = useState(loggedIn);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getUserData();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [accessToken]);

	async function getUserData() {
		try {
			if (accessToken) {
				setIsLoggedIn(true);
				setLoading(true);
				const response = await api.get('account/currentuserdata');
				const apiData = response?.data;
				const userData = apiData?.user;
				const userRoleName = apiData?.roles.toString();
				if(userData){
					setUser(userData);
					setUserPages(apiData.pages);
					setUserName(userData.email);
					setUserId(userData.id);
					setUserEmail(userData.email);
					setUserPhoto(null);
					setUserPhone(null);
					setUserRole(userRoleName);
				}
			}
			else {
				setIsLoggedIn(false);
			}
		}
		catch (e) {
			setError("Unable to get user data");
			logout();
		}
		finally {
			setLoading(false);
		}
	}
	
	async function login(token) {
		localStore.saveLoginData({ token });
		setIsLoggedIn(true);
	}

	function logout(returnUrl=null) {
		localStore.removeLoginData();
		setUser(null);
		setIsLoggedIn(false);
		setLoading(true);
		if(returnUrl){
			navigate(`/?redirect=${returnUrl}` );
		}
		else{
			navigate('/');
		}
	}

	function pageRequiredAuth(path){
		const { pageName, routePath } = utils.parseRoutePath(path);
		return !publicPages.includes(pageName) && !publicPages.includes(routePath);
	}

	function canView(path){
		const { routePath } = utils.parseRoutePath(path);
		return userPages.includes(routePath);
	}

	function canManage(page, userRecId){
		if(userRole){
			let userRoleAbilities = roleAbilities[userRole.toLowerCase()] || [];
			if (userRoleAbilities.includes(page)){
				return true;
			}
		}
		return userRecId == user.user_id;
	}

	function isOwner(userRecId) {
		if(user){
			return userRecId == user.user_id;
		}
		return false;
	}

	
	const isAdmin = userRole.toLowerCase() === 'admin';

	const isUser = userRole.toLowerCase() === 'user';


	const providerValue = {
		user,
		userName,
		userId,
		userEmail,
		userPhone,
		userPhoto,
		userRole,
		loading,
		isLoggedIn,
		accessToken,
		error,
		loading,
		getUserData,
		pageRequiredAuth,
		login,
		logout,
		canView,
		canManage,
		isOwner,
		isAdmin, isUser
	}

	return (
		<AuthContext.Provider value={providerValue}>
			{children}
		</AuthContext.Provider>
	);
}

export {AuthContext}
