import '../styles/Settings.scss';

import {
	Brush,
	BrushOutlined,
	DriveFileRenameOutline,
	DriveFileRenameOutlineOutlined,
	Public,
} from '@mui/icons-material';
import { Outlet } from 'react-router-dom';

import { MenuTab } from '../MainLayout.js';
import resolveRoute from '../resolveRoute.js';

export default function Settings() {
	return (
		<>
			<main className="settings">
				<div className="menu fixed-wide">
					<div className="menu-list">
						<MenuTab
							route={resolveRoute('/settings/', 'search')}
							name="Search"
							iconFilled={<Public />}
						/>
						<MenuTab
							route={resolveRoute('/settings/', 'appearance')}
							name="Appearance"
							iconFilled={<Brush />}
							iconOutlined={<BrushOutlined />}
						/>
						<MenuTab
							route={resolveRoute('/settings/', 'tabcloak')}
							name="Tab Cloak"
							iconFilled={<DriveFileRenameOutline />}
							iconOutlined={<DriveFileRenameOutlineOutlined />}
						/>
					</div>
				</div>
				<Outlet />
			</main>
		</>
	);
}
