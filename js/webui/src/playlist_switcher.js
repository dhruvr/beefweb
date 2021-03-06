import React from 'react'
import PropTypes from 'prop-types'
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { PlaybackState } from 'beefweb-client'
import Component from './component'
import PlayerModel from './player_model'
import PlaylistModel from './playlist_model'
import SettingsModel from './settings_model'
import { Icon } from './elements'
import urls from './urls'
import { bindHandlers } from './utils'
import { makeClassName } from './dom_utils'

const playbackStateIcons = {
    [PlaybackState.playing]: 'media-play',
    [PlaybackState.paused]: 'media-pause',
    [PlaybackState.stopped]: 'none',
};

function PlaylistTabHandleInner()
{
    return (
        <Icon name='ellipses' className='drag-handle' />
    );
}

const PlaylistTabHandle = SortableHandle(PlaylistTabHandleInner);

class PlaylistTabInner extends React.PureComponent
{
    componentDidMount()
    {
        const { playlist, currentPlaylistId} = this.props;

        if (playlist.id === currentPlaylistId)
            this.element.scrollIntoView();
    }

    render()
    {
        const {
            playlist: p,
            playbackState,
            activePlaylistId,
            currentPlaylistId,
            drawHandle
        } = this.props;

        const className = makeClassName({
            'header-tab': true,
            'header-tab-with-icon': true,
            'header-tab-active': p.id === currentPlaylistId
        });

        const handle = drawHandle
            ? <PlaylistTabHandle />
            : null;

        const icon = p.id === activePlaylistId
            ? playbackStateIcons[playbackState]
            : 'none';

        return (
            <li className={className} ref={el => this.element = el}>
                {handle}
                <Icon name={icon} className='header-tab-icon' />
                <a href={urls.viewPlaylist(p.id)} title={p.title}>
                    {p.title}
                </a>
            </li>
        );
    }
}

const PlaylistTab = SortableElement(PlaylistTabInner);

function PlaylistTabListInner(props)
{
    const {
        playbackState,
        activePlaylistId,
        currentPlaylistId,
        playlists,
        drawHandle
    } = props;

    return (
        <ul className='header-block header-block-primary'>
            {
                playlists.map(p => (
                    <PlaylistTab
                        key={p.id}
                        index={p.index}
                        playlist={p}
                        playbackState={playbackState}
                        activePlaylistId={activePlaylistId}
                        currentPlaylistId={currentPlaylistId}
                        drawHandle={drawHandle} />
                ))
            }
        </ul>
    );
}

const PlaylistTabList = SortableContainer(PlaylistTabListInner);

export default class PlaylistSwitcher extends Component
{
    constructor(props)
    {
        super(props);

        this.updateOn({
            playerModel: 'change',
            playlistModel: 'playlistsChange',
            settingsModel: 'touchModeChange',
        });

        this.state = this.getStateFromModel();
        bindHandlers(this);
    }

    getStateFromModel()
    {
        const { playbackState, activeItem } = this.props.playerModel;
        const activePlaylistId = activeItem.playlistId;

        const { currentPlaylistId, playlists } = this.props.playlistModel;
        const { touchMode } = this.props.settingsModel;

        return {
            playbackState,
            activePlaylistId,
            currentPlaylistId,
            playlists,
            touchMode
        };
    }

    handleSortEnd(e)
    {
        this.props.playlistModel.movePlaylist(e.oldIndex, e.newIndex);
    }

    render()
    {
        const {
            playbackState,
            activePlaylistId,
            currentPlaylistId,
            playlists,
            touchMode
        } = this.state;

        return (
            <PlaylistTabList
                playbackState={playbackState}
                activePlaylistId={activePlaylistId}
                currentPlaylistId={currentPlaylistId}
                playlists={playlists}
                onSortEnd={this.handleSortEnd}
                axis='x'
                lockAxis='x'
                helperClass='dragged'
                distance={touchMode ? null : 30}
                useDragHandle={touchMode}
                drawHandle={touchMode} />
        );
    }
}

PlaylistSwitcher.propTypes = {
    playerModel: PropTypes.instanceOf(PlayerModel).isRequired,
    playlistModel: PropTypes.instanceOf(PlaylistModel).isRequired,
    settingsModel: PropTypes.instanceOf(SettingsModel).isRequired
};
