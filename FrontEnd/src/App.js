import { BrowserRouter, Route, Switch } from "react-router-dom";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import AdminGroups from "./pages/AdminGroups";
import AdminGroup from "./pages/AdminGroup";
import AdminGroupCreate from "./pages/AdminGroupCreate";
import Logout from "./components/Logout";
import ManagerLogin from "./pages/ManagerLogin";
import useLocalState, { IsAuthenticatedContext } from "./utils/useLocalState";
import ManagerGroup from "./pages/ManagerGroup";
import ManagerRequests from "./pages/ManagerRequests";
import UserGroups from "./pages/UserGroups";
import UserRegister from "./pages/UserRegister";
import UserLogin from "./pages/UserLogin";
import UserRequests from "./pages/UserRequests";
import UserFileUpload from "./pages/UserFileUpload";
import UserFileDownload from "./pages/UserFileDownload";
import ManagerFileDownload from "./pages/ManagerFileDownload";
import ManagerFileUpload from "./pages/ManagerFileUpload";

// let P = 42144366793245396716227893492888489522912336514882657035214414288024566868499n;
// let Q = 1239540199801335197536114514496720280085656956320078148094541596706604907897n;
// let G = 9314978633812438002952252984184064596816739821078769869430174908118104702615n;
// let xi1 = 5867536015003039856420220325384169988081215815218645187853899460520827789969n;
// let yi1 = 4253729872603419309270437529715658235921908990471571853380020590622144187451n;
// let xi2 = 23645728748330545974359726574721390207474709509739852603681454181018006894045n;
// let yi2 = 29689039754721456200671737816115448487640806656783112518306828929358772374381n;
// let k = 1090335364768251850520964443760973694938497894669462618252626887456707480866n;
// for (let i = 1; i <= 30; i++) {
// 	console.time(i * 10);
// 	for (let j = 0; j < i * 10; j++) {
// 		modPow(modPow(G, xi2, P), k, P);
// 	}
// 	console.timeEnd(i * 10);
// }

// function findXandY() {
// 	let p = 2892008489112152977727500423395925534448265782469434025702914019945396937427n;
// 	let q = 1446004244556076488863750211697962767224132891234717012851457009972698468713n;
// 	let g = 2411791678875673015167120597615695985272696273651930040967888045705490681206n;
// 	let xi = 2533028058966872115703619831830940557435678967102178041576202623062754158807n;
// 	let yi = 1299883657906481171208196598721099303456493019960379314359072363648238311173n;
// 	let Xi = 1157075261077181054030007485712556856583731636916774217287642520874318871275n;
// 	let Xik = 395744852298062469220197355513310774669332736095806511827374907831173166549n;
// 	let gk = modPow(Xik, yi, p);
// 	console.log(
// 		gk ===
// 			1790056858506605177147474530640938081753288635006049346046186230251086758263n
// 	);
// find_xi( 3490214590970643266829347708884132280515133032822901341029123470833482886823n
// ).then((val) => {
// 	console.log(val);
// 	find_yi(
// 		val,
// 		3490214590970643266829347708884132280515133032822901341029123470833482886823n
// 	).then((num) => {
// 		console.log(num);
// 		console.log(
// 			(val * num) %
// 				(3490214590970643266829347708884132280515133032822901341029123470833482886823n -
// 					1n)
// 		);
// 	});
// });
// }

function App() {
	const [isAuthenticated, setIsAuthenticated] = useLocalState(
		"token",
		localStorage.getItem("token") || ""
	);

	return (
		<BrowserRouter>
			<IsAuthenticatedContext.Provider
				value={[isAuthenticated, setIsAuthenticated]}
			>
				<Switch>
					<Route path="/" exact component={Home} />
					<Route path="/admin/login" exact component={AdminLogin} />
					<Route
						path="/manager/login"
						exact
						component={ManagerLogin}
					/>
					<Route
						path="/user/register"
						exact
						component={UserRegister}
					/>
					<Route path="/user/login" exact component={UserLogin} />
					{isAuthenticated && (
						<>
							<Route
								path="/admin/groups"
								exact
								component={AdminGroups}
							/>
							<Route
								path="/admin/groupsCreate"
								exact
								component={AdminGroupCreate}
							/>
							<Route
								path="/admin/groups/:id"
								component={AdminGroup}
							/>
							<Route
								path={[
									"/admin/logout",
									"/manager/logout",
									"/user/logout",
								]}
								component={Logout}
							/>
							<Route
								path="/manager/group"
								exact
								component={ManagerGroup}
							/>
							<Route
								path="/manager/requests"
								exact
								component={ManagerRequests}
							/>
							<Route
								path="/manager/files"
								exact
								component={ManagerFileDownload}
							/>
							<Route
								path="/manager/files/upload"
								exact
								component={ManagerFileUpload}
							/>
							<Route
								path="/user/groups"
								exact
								component={UserGroups}
							/>
							<Route
								path="/user/groups/:id"
								exact
								component={UserFileUpload}
							/>
							<Route
								path="/user/groups/:id/download"
								exact
								component={UserFileDownload}
							/>
							<Route
								path="/user/requests"
								exact
								component={UserRequests}
							/>
						</>
					)}
				</Switch>
			</IsAuthenticatedContext.Provider>
		</BrowserRouter>
	);
}

export default App;
