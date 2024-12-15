import { FC } from "react";
import { Button, Grid, GridColumn, GridRow, Header } from "semantic-ui-react";
import { PageHeaderButton } from "../providers";

export type PageHeaderProps = {
  caption?: string;
  buttons: Array<PageHeaderButton>
};

export const PageHeader: FC<PageHeaderProps> = ({ caption, buttons }: PageHeaderProps) => {
  return <Grid columns={2}>
    <GridRow>
      <GridColumn>
        <Header as='h2' color="teal" content={caption} textAlign='left'></Header>
      </GridColumn>
      <GridColumn textAlign="right">
        { buttons.map((button, i) => 
            <Button key={`header_btn_${i}`} color={button.color} 
              disabled={button.disabled} icon={button.icon} onClick={(_: unknown) => button.onClick()}>
              {button.text}
            </Button>
        ) }
      </GridColumn>
    </GridRow>
  </Grid>;
}