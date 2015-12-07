suniyya_wllai_namer_uayyaz_final
================================

Representation Invariants and Mutability:
=========================================

1. Once an occasion has been created then the following attributes can not be mutated
	a). Sharing Settings 
	b). Public Link to the occasion 
	c). Publishing Date and Time

2. Only creator and (specified) participants can add thoughts to an occasion

3. The creator, participants, and recipients can not be changed 

4. A participant can only edit or delete their own thoughts. They cannot delete thoughts made by other participants.


Security Concerns Addressed:
============================

1. All users require permissions to access the website. A user cannot create a fake url, e.g. http://occasionalthoughts.herokuapp.com/maliciousUser will not be allowed access because each user is verified in the database before being granted access to the website. 

2. We implemented an extensive privacy feature in our design which gives users the ability to specify who can view/participate in occasions. This prevents unwanted/uninvited users from accessing/viewing/contributing to an occasion. 

3. As part of a security feature we allow the creator of an occasion to delete any thought contributed to the occasion. However the creator can NOT edit participants' thoughts. This prevents malicious editing/spamming on behalf of the creator. 

4. We are using facebook, due to its greater reliability, to authenticate users. This helps us mitigate several security concerns:
		a). 


