function openSkillSpringExpertDialog(account, expertId) {
	var loConnect = document.createElement("lo-connect");
	loConnect.setAttribute("account", account);
	loConnect.setAttribute("variant", "transparent");
	loConnect.setAttribute("skip-initial-question", "true");
	loConnect.setAttribute("expert-id-filter", expertId);
	loConnect.addEventListener('lo-connect-initialization', function (event) {
		if (!event.error) {
			event.detail.openDialog();
		}
	});

	document.body.insertAdjacentElement("beforeend", loConnect);
}

function openSkillSpringGroupSessionDialog(groupSessionId) {
	var loConnect = document.createElement("lo-connect");
	loConnect.setAttribute("variant", "transparent");
	loConnect.setAttribute("group-session-id-filter", groupSessionId);
	loConnect.addEventListener('lo-connect-initialization', function (event) {
		if (!event.error) {
			event.detail.openDialog();
		}
	});

	document.body.insertAdjacentElement("beforeend", loConnect);
}