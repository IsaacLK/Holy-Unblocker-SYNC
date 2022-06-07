import { CheckCircle, Error, Info, Warning } from '@mui/icons-material';
import clsx from 'clsx';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import { Obfuscated } from './obfuscate.js';

const ANIMATION = 0.3e3;

/**
 *
 * @param {{manager: import('react').RefObject<NotificationsManager>, id: string, type: 'warning'|'error'|'sucess'|'info', duration: number, title: JSX.Element, description: JSX.Element}} props
 */
export function Notification(props) {
	const [hide, set_hide] = useState(false);

	const duration = props.duration || 5e3;

	useEffect(() => {
		setTimeout(() => {
			set_hide(true);
			setTimeout(() => props.manager.current.delete(props.id), ANIMATION);
		}, duration);
	}, [duration, props.id, props.manager]);

	let Icon;

	switch (props.type) {
		case 'warning':
			Icon = Warning;
			break;
		case 'error':
			Icon = Error;
			break;
		case 'success':
			Icon = CheckCircle;
			break;
		default:
		case 'info':
			Icon = Info;
			break;
	}

	return (
		<div
			className={clsx('notification', hide && 'hide', props.title && 'title')}
		>
			<Icon className={`icon ${props.type}`} />
			<div className="content">
				{props.title && (
					<div className="title">
						<Obfuscated>{props.title}</Obfuscated>
					</div>
				)}
				{props.description && (
					<div className="description">
						<Obfuscated>{props.description}</Obfuscated>
					</div>
				)}
			</div>
			<div
				className="timer"
				style={{ animationDuration: `${duration / 1000}s` }}
			/>
		</div>
	);
}

export default forwardRef(function NotificationsManager(_props, ref) {
	/**
	 * @type {Notification[]}
	 */
	const [notifications, set_notifications] = useState([]);

	useImperativeHandle(
		ref,
		() => ({
			/**
			 *
			 * @param {Notification} notification
			 */
			add(notification) {
				const id = Math.random().toString(36);
				const _notifications = [...notifications];

				_notifications.push(
					<Notification
						{...notification.props}
						key={id}
						id={id}
						manager={ref}
					/>
				);

				set_notifications(_notifications);
			},
			/**
			 *
			 * @param {string} id
			 */
			delete(id) {
				const _notifications = [...notifications];

				for (let i = 0; i < _notifications.length; i++) {
					const notification = _notifications[i];

					if (notification.props.id !== id) {
						continue;
					}

					_notifications.splice(i, 1);
					set_notifications(_notifications);

					return true;
				}

				return false;
			},
		}),
		[notifications, ref]
	);

	return <div className="notifications">{notifications}</div>;
});
