import React from 'react';
import { View } from 'react-native';
import { render } from './helpers';

import { MenuTrigger, MenuOptions } from '../src/index';

jest.mock('../src/helpers', () => ({
  makeName: () => 'generated-name'
}));

jest.dontMock('../src/Menu');
const Menu = require('../src/Menu').default;

const { objectContaining, createSpy, any } = jasmine;

describe('Menu', () => {

  it('should render component and preserve children order', () => {
    const { output } = render(
      <Menu>
        <Text>Some text</Text>
        <MenuTrigger />
        <MenuOptions />
        <Text>Some other text</Text>
      </Menu>
    );
    expect(output.type).toEqual(View);
    expect(output.props.children.length).toEqual(3);
    expect(output.props.children[0]).toEqual(
      <Text>Some text</Text>
    );
    expect(output.props.children[1]).toEqual(objectContaining({
      type: MenuTrigger,
      props: objectContaining({
        events: objectContaining({
          onRef: any(Function),
          onPress: any(Function)
        })
      })
    }));
    expect(output.props.children[2]).toEqual(
      <Text>Some other text</Text>
    );
  });

  it('should subscribe menu', () => {
    const { instance } = render(
      <Menu name='menu1'>
        <MenuTrigger />
        <MenuOptions />
      </Menu>
    );
    const menuRegistry = {
      subscribe: createSpy()
    };
    instance.context = { menuRegistry };
    instance.componentDidMount();
    expect(menuRegistry.subscribe).toHaveBeenCalledWith('menu1', objectContaining({
      name: 'menu1',
      options: any(Object)
    }));
  });

  it('should subscribe events', () => {
    const onOpen = () => 1, onClose = () => 2;
    const { instance } = render(
      <Menu onOpen={ onOpen } onClose={ onClose } name='menu1'>
        <MenuTrigger />
        <MenuOptions />
      </Menu>
    );
    const menuRegistry = {
      subscribe: createSpy()
    };
    instance.context = { menuRegistry };
    instance.componentDidMount();
    expect(menuRegistry.subscribe).toHaveBeenCalledWith('menu1', objectContaining({
      name: 'menu1',
      events: objectContaining({ onOpen, onClose })
    }));
  });

  it('should subscribe menu with auto-generated name', () => {
    const { instance } = render(
      <Menu>
        <MenuTrigger />
        <MenuOptions />
      </Menu>
    );
    const menuRegistry = {
      subscribe: createSpy()
    };
    instance.context = { menuRegistry };
    instance.componentDidMount();
    expect(menuRegistry.subscribe).toHaveBeenCalledWith('generated-name', any(Object));
  });

  it('should unsubscribe menu', () => {
    const { instance } = render(
      <Menu name='menu1'>
        <MenuTrigger />
        <MenuOptions />
      </Menu>
    );
    const menuRegistry = {
      subscribe: createSpy(),
      unsubscribe: createSpy()
    };
    instance.context = { menuRegistry };
    instance.componentDidMount();
    expect(menuRegistry.subscribe).toHaveBeenCalledWith('menu1', any(Object));
    instance.componentWillUnmount();
    expect(menuRegistry.unsubscribe).toHaveBeenCalledWith('menu1');
  });

  it('should update menu', () => {
    const { instance, output } = render(
      <Menu name='menu1'>
        <MenuTrigger />
        <MenuOptions />
      </Menu>
    );
    const menuRegistry = {
      subscribe: createSpy(),
      update: createSpy()
    };
    instance.context = { menuRegistry };
    instance.componentDidMount();
    const [ trigger ] = output.props.children;
    trigger.props.events.onRef('trigger_ref');
    instance.componentDidUpdate();
    expect(menuRegistry.update).toHaveBeenCalledWith('menu1', objectContaining({
      name: 'menu1',
      trigger: 'trigger_ref',
    }));
  });

  it('should trigger on select and close menu', () => {
    const onSelectSpy = createSpy();
    const { instance } = render(
      <Menu name='menu1' onSelect={ onSelectSpy }>
        <MenuTrigger />
        <MenuOptions />
      </Menu>
    );
    const menuActions = {
      closeMenu: createSpy()
    };
    let subscribedOnSelect;
    const menuRegistry = {
      subscribe: (name, menu) => (subscribedOnSelect = menu.options.props.onSelect)
    };
    instance.context = { menuRegistry, menuActions };
    instance.componentDidMount();
    expect(typeof subscribedOnSelect).toEqual('function');
    subscribedOnSelect('value1');
    expect(onSelectSpy).toHaveBeenCalledWith('value1');
    expect(menuActions.closeMenu).toHaveBeenCalled();
  });

  it('should trigger on select and let menu open', () => {
    const onSelectSpy = createSpy().and.returnValue(false);
    const { instance } = render(
      <Menu name='menu1' onSelect={ onSelectSpy }>
        <MenuTrigger />
        <MenuOptions />
      </Menu>
    );
    const menuActions = {
      closeMenu: createSpy()
    };
    let subscribedOnSelect;
    const menuRegistry = {
      subscribe: (name, menu) => (subscribedOnSelect = menu.options.props.onSelect)
    };
    instance.context = { menuRegistry, menuActions };
    instance.componentDidMount();
    expect(typeof subscribedOnSelect).toEqual('function');
    subscribedOnSelect('value1');
    expect(onSelectSpy).toHaveBeenCalledWith('value1');
    expect(menuActions.closeMenu).not.toHaveBeenCalled();
  });

  it('should open menu', () => {
    const { output, instance } = render(
      <Menu name='menu1'>
        <MenuTrigger />
        <MenuOptions />
      </Menu>
    );
    const menuRegistry = {
      subscribe: createSpy()
    };
    const menuActions = {
      openMenu: createSpy()
    };
    instance.context = { menuRegistry, menuActions };
    instance.componentDidMount();
    const [ trigger ] = output.props.children;
    expect(typeof trigger.props.events.onPress).toEqual('function');
    trigger.props.events.onPress();
    expect(menuActions.openMenu).toHaveBeenCalledWith('menu1');
  });

});