import React, { useEffect } from "react";
import { useSelector } from "react-redux"
import { Route, 
		 Redirect } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getUser } from "../../store/actions/user";
import { selectUser } from "../../store/selectors/user";
import './index.css';
const PrivateRoute = ({ children, type = 'any', ...rest}) => {

	const user = useSelector(selectUser);
	const dispatch = useDispatch();

    useEffect(() => {
		dispatch(getUser());
	},[dispatch]);

	return (
		<Route
		  {...rest}
		  render={({ location }) =>
			type !== 'any' && user && user.type !== type ? 
			<Redirect to={`/${user.type}`} />
			: user ? (
			  children
			) : (
			  <Redirect
				to={{
				  pathname: "/login",
				  state: { from: location }
				}}
			  />
			)
		  }
		/>
	);
};

export default PrivateRoute;
