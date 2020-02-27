import React, { useState, useEffect } from 'react';

export default function Home() {
	const [home, setHome] = useState('home');
	useEffect(() => {
		setHome('home-----')
	}, ['home']);

	return (
		<div>{home}
			
		</div>
	)
}